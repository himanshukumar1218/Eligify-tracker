const prepQueries = require('../queries/prepTrackerQueries');

exports.getExams = async (req, res) => {
  try {
    const exams = await prepQueries.listExams();

    return res.status(200).json({
      success: true,
      message: "Exams fetched successfully",
      data: exams
    });
  } catch (err) {
    console.error("Error Fetching Exams:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.addPrepTask = async (req, res) => {
  try {
    const userId = req.user.id;
    // Assuming your validation middleware assigns to req.validatedBody or mutates req.body
    const { examId, title, dueDate } = req.validatedBody || req.body; 

    const task = await prepQueries.insertPrepTask(userId, examId, title, dueDate);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (err) {
    console.error("Error Creating Task:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.listPrepTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = Number(req.query.examId);

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Valid examId query parameter is required"
      });
    }

    const tasks = await prepQueries.listPrepTasksByExam(userId, examId);

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks
    });
  } catch (err) {
    console.error("Error Fetching Tasks:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Valid taskId parameter is required"
      });
    }

    const task = await prepQueries.togglePrepTask(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task toggled successfully",
      data: task
    });
  } catch (err) {
    console.error("Error Toggling Task:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.removeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Valid taskId parameter is required"
      });
    }

    const deleted = await prepQueries.deletePrepTask(taskId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deleted
    });
  } catch (err) {
    console.error("Error Deleting Task:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.savePrepNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId, content } = req.validatedBody || req.body;

    const note = await prepQueries.upsertPrepNote(userId, examId, content);

    return res.status(200).json({
      success: true,
      message: "Notes saved successfully",
      data: note
    });
  } catch (err) {
    console.error("Error Saving Notes:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.fetchPrepNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = Number(req.query.examId);

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Valid examId query parameter is required"
      });
    }

    const note = await prepQueries.getPrepNote(userId, examId);

    return res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: note || null
    });
  } catch (err) {
    console.error("Error Fetching Notes:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
exports.savePrepDailyNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examId, noteDate, content } = req.body;

    if (!examId || !noteDate || !content) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const note = await prepQueries.upsertPrepDailyNote(userId, examId, noteDate, content);

    return res.status(200).json({
      success: true,
      message: "Daily note saved successfully",
      data: note
    });
  } catch (err) {
    console.error("Error Saving Daily Note:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.fetchPrepDailyNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = Number(req.query.examId);

    if (!examId) return res.status(400).json({ success: false, message: "Missing examId" });

    const notes = await prepQueries.getPrepDailyNotes(userId, examId);
    return res.status(200).json({ success: true, data: notes });
  } catch (err) {
    console.error("Error Fetching Daily Notes:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.fetchPrepStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = Number(req.query.examId);

    if (!examId) return res.status(400).json({ success: false, message: "Missing examId" });

    const tasks = await prepQueries.getPrepStatsData(userId, examId);

    // Compute stats here
    const total = tasks.length;
    let completed = 0;
    const activityMap = {};

    tasks.forEach(t => {
      if (t.completed) {
        completed++;
        if (t.completed_at) {
          const dStr = new Date(t.completed_at).toISOString().split('T')[0];
          activityMap[dStr] = (activityMap[dStr] || 0) + 1;
        }
      }
    });

    // compute streaks
    let currentStreak = 0;
    let longestStreak = 0;
    const dates = Object.keys(activityMap).sort();

    if (dates.length > 0) {
      longestStreak = 1;
      let tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      const todayD = new Date();
      todayD.setHours(0,0,0,0);
      let streakDate = new Date(todayD);
      currentStreak = 0;
      while (activityMap[streakDate.toISOString().split('T')[0]] !== undefined) {
        currentStreak++;
        streakDate.setDate(streakDate.getDate() - 1);
      }
    }

    return res.status(200).json({
      success: true,
      data: { total, completed, activityMap, currentStreak, longestStreak }
    });
  } catch (err) {
    console.error("Error Fetching Stats:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
