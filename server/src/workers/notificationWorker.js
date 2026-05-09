const { Worker } = require("bullmq");
const { connection } = require("../queue/notificationQueue");
const pool = require("../db");
const { getAllUsers } = require("../queries/userQueries");
const { checkEligibility } = require("../eligibilityEngine/checkEligibility");
const { bulkInsertNotifications } = require("../queries/notificationQueries");
const { sendMatchEmail } = require("../services/emailService");

const processExamScan = async (job) => {
    const { examId, examName } = job.data;
    console.log(`[Worker] Started processing exam scan for ExamID: ${examId} - ${examName}`);

    // 1. Fetch all posts for this exam
    const postResult = await pool.query('SELECT id, post_name, exam_id FROM exam_posts WHERE exam_id = $1', [examId]);
    const posts = postResult.rows;

    if (!posts || posts.length === 0) {
        console.log(`[Worker] No posts found for ExamID: ${examId}. Aborting.`);
        return;
    }

    // 2. Fetch all users
    const users = await getAllUsers();
    console.log(`[Worker] Fetched ${users.length} users to scan against ${posts.length} posts.`);

    const notificationsToInsert = [];

    // 3. Scan each user against each post
    for (const user of users) {
        for (const post of posts) {
            try {
                const result = await checkEligibility(user.id, post.id);
                if (result.eligible) {
                    notificationsToInsert.push({
                        userId: user.id,
                        postId: post.id,
                        title: `New Match: ${examName}`,
                        message: `You are eligible for the ${post.post_name} post. Applications are now open!`,
                        category: 'alert'
                    });

                    // Fire and forget email notification
                    sendMatchEmail(user.email, user.username, examName, post.post_name).catch(e => console.error(e));
                }
            } catch (err) {
                // Ignore incomplete profile errors or system errors internally so one failure doesn't break the whole queue
                if (err.code !== 'PROFILE_INCOMPLETE') {
                    // console.error(`Failed to scan user ${user.id} against post ${post.id}`, err.message);
                }
            }
        }
    }

    // 4. Bulk insert matched notifications
    if (notificationsToInsert.length > 0) {
        console.log(`[Worker] Found ${notificationsToInsert.length} total matches. Inserting notifications...`);
        await bulkInsertNotifications(notificationsToInsert);
    } else {
        console.log(`[Worker] Scan complete. Found 0 matches.`);
    }
};

const processDeadlineScan = async (job) => {
    console.log(`[Worker] Started DailyDeadlineScan`);
    
    // We are looking for exams closing in exactly 3 days
    const daysLeft = 3;
    const { getExamsClosingInDays } = require("../eligibilityEngine/queries/eligibilityQueries");
    const { sendDeadlineEmail } = require("../services/emailService");
    
    const closingExams = await getExamsClosingInDays(daysLeft);
    if (!closingExams || closingExams.length === 0) {
        console.log(`[Worker] No exams closing in ${daysLeft} days.`);
        return;
    }

    const users = await getAllUsers();
    console.log(`[Worker] Scanning ${users.length} users against ${closingExams.length} closing exams.`);

    const notificationsToInsert = [];

    for (const exam of closingExams) {
        const postResult = await pool.query('SELECT id, post_name FROM exam_posts WHERE exam_id = $1', [exam.exam_id]);
        const posts = postResult.rows;

        for (const user of users) {
            for (const post of posts) {
                try {
                    const result = await checkEligibility(user.id, post.id);
                    if (result.eligible) {
                        notificationsToInsert.push({
                            userId: user.id,
                            postId: post.id,
                            title: `Deadline Alert: ${exam.exam_name}`,
                            message: `Only ${daysLeft} days left to apply for the ${post.post_name} post. If already applied, please ignore.`,
                            category: 'alert'
                        });

                        sendDeadlineEmail(user.email, user.username, exam.exam_name, post.post_name, daysLeft).catch(e => console.error(e));
                    }
                } catch (err) {
                    if (err.code !== 'PROFILE_INCOMPLETE') {
                        // ignore
                    }
                }
            }
        }
    }

    if (notificationsToInsert.length > 0) {
        console.log(`[Worker] Found ${notificationsToInsert.length} deadline alerts to send.`);
        await bulkInsertNotifications(notificationsToInsert);
    } else {
        console.log(`[Worker] Deadline scan complete. 0 alerts.`);
    }
};

const dispatchJob = async (job) => {
    if (job.name === 'DailyDeadlineScan') {
        return processDeadlineScan(job);
    }
    // Default to processExamScan (e.g. for ScanExamEvent)
    return processExamScan(job);
};

const notificationWorker = new Worker('NotificationQueue', dispatchJob, {
    connection,
    concurrency: 2 
});

notificationWorker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} failed with error ${err.message}`);
});

module.exports = notificationWorker;
