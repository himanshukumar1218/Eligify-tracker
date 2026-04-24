import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Clock, Bell, AlertTriangle, ArrowRight, CheckCircle2, UserCircle } from 'lucide-react';
import { getEligibilityReadiness, type MissingField } from '../utils/profileReadiness';
import { API_BASE } from '../utils/api';
import Loader from '../components/ui/Loader';

// Types
type ExamRow = {
  postId: number;
  examName: string;
  deadline: string;
  timingStatus: string;
};

type EligibleExamsData = {
  eligibleCount: number;
  nearMatchCount: number;
  eligible: ExamRow[];
};

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

// Component
const DashboardHomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, isReady: false, missingFields: [] as MissingField[] });
  const [examsData, setExamsData] = useState<EligibleExamsData | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<ExamRow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        // Run fetches in parallel
        const [profileRes, examsRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/profile`, { headers }),
          fetch(`${API_BASE}/api/exams/eligible`, { headers }),
          fetch(`${API_BASE}/api/notifications`, { headers })
        ]);

        const profileJson = await profileRes.json();
        const examsJson = await examsRes.json();
        const notifJson = await notifRes.json();

        // 1. Profile Readiness
        if (profileJson.success && profileJson.data) {
          const readiness = getEligibilityReadiness(profileJson.data);
          const totalFields = 7; // Base fields as defined in profileReadiness.ts
          const missingCount = readiness.missingFields.length;
          const calculatedPercent = readiness.isReady ? 100 : Math.round(((totalFields - Math.min(missingCount, totalFields)) / totalFields) * 100);
          
          setProfileCompletion({
            percent: Math.max(15, calculatedPercent), // give at least 15% so bar is visible
            isReady: readiness.isReady,
            missingFields: readiness.missingFields.slice(0, 3) // show max 3 to avoid clutter
          });
        }

        // 2. Exams & Deadlines
        if (examsJson.success && examsJson.data) {
          setExamsData(examsJson.data);
          
          // Sort deadlines (closest first)
          const allExams = examsJson.data.eligible || [];
          const sorted = [...allExams]
            .filter((e) => new Date(e.deadline).getTime() > Date.now())
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 3); // top 3
          
          setUpcomingDeadlines(sorted);
        }

        // 3. Notifications
        if (notifJson.success && notifJson.data) {
          setNotifications(notifJson.data.slice(0, 3)); // top 3
        }

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Animations
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return <Loader text="Synchronizing Data" />;
  }

  const isProfileAlmostComplete = profileCompletion.percent >= 90;

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_20px_60px_rgba(2,6,23,0.45)]"
      >
        <img 
          src="/images/dashboard-banner.png" 
          alt="Welcome" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Command Center</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Welcome back.
            </h1>
            <p className="mt-2 text-slate-300 max-w-md text-sm leading-relaxed">
              Your real-time snapshot of eligibility matches, upcoming deadlines, and platform alerts.
            </p>
          </div>
          <Link
            to="/eligible-exams"
            className="group flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md border border-white/10 transition-all hover:bg-white/20 hover:scale-105"
          >
            Explore All Exams
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="visible" 
        className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]"
      >
        {/* 2. Profile Completion (Dynamic Size) */}
        <motion.section variants={fadeInUp} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur flex flex-col justify-between">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <UserCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Profile Readiness</h2>
                <p className="text-xs text-slate-400">{isProfileAlmostComplete ? 'Fully verified and ready.' : 'Action required for accurate matches.'}</p>
              </div>
            </div>
            {!isProfileAlmostComplete && (
              <Link to="/student-details" className="text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300">
                Edit Profile
              </Link>
            )}
          </div>

          {isProfileAlmostComplete ? (
            <div className="flex-1 flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
               <div className="flex flex-col items-center text-center">
                 <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
                 <h3 className="text-xl font-bold text-emerald-100">100% Verified</h3>
                 <p className="text-sm text-emerald-200/60 mt-1 max-w-sm">Your profile is completely filled out. The Eligibility Engine is running at maximum accuracy.</p>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <p className="text-5xl font-extrabold tracking-tight text-white">{profileCompletion.percent}%</p>
                <Link to="/student-details" className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  Complete Now
                </Link>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion.percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {profileCompletion.missingFields.length > 0 ? (
                  profileCompletion.missingFields.map((field) => (
                    <div key={field.key} className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                      <p className="text-xs font-medium text-rose-200 truncate" title={field.label}>Needs {field.label}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-slate-400">Add remaining documents to reach 100%.</div>
                )}
              </div>
            </div>
          )}
        </motion.section>

        {/* 3. Eligible Exams Snapshot */}
        <motion.section variants={fadeInUp} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur flex flex-col">
           <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live Matches</h2>
                <p className="text-xs text-slate-400">Based on your current profile.</p>
              </div>
            </div>
            <Link to="/eligible-exams" className="text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300">
              View All
            </Link>
          </div>

          {!profileCompletion.isReady && profileCompletion.percent < 90 ? (
             <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-950/50 p-6 text-center">
               <ShieldCheck className="h-8 w-8 text-slate-500 mb-3 opacity-50" />
               <p className="text-sm font-semibold text-slate-300">Matches Locked</p>
               <p className="text-xs text-slate-500 mt-1">Complete your profile to unlock.</p>
             </div>
          ) : (
             <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400">
                    {examsData?.eligibleCount || 0}
                  </p>
                  <p className="text-sm font-medium text-emerald-400 mt-1 uppercase tracking-widest">Exams Ready to Apply</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Near Matches</p>
                    <div className="flex items-end gap-2 mt-2">
                      <Zap className="h-4 w-4 text-amber-400 mb-1" />
                      <p className="text-2xl font-bold text-white">{examsData?.nearMatchCount || 0}</p>
                    </div>
                  </div>
                   <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Update Status</p>
                    <div className="flex items-end gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" />
                      <p className="text-xl font-bold text-white">Live</p>
                    </div>
                  </div>
                </div>
             </div>
          )}
        </motion.section>
      </motion.div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="visible" 
        className="grid gap-6 xl:grid-cols-2"
      >
        {/* 4. Upcoming Deadlines */}
        <motion.section variants={fadeInUp} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Urgent Deadlines</h2>
              <p className="text-xs text-slate-400">Approaching milestones for matched exams.</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((exam) => (
                <div key={exam.postId} className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 transition-all hover:bg-white/5 border-l-4 border-l-amber-400">
                  <div>
                    <p className="font-bold text-white">{exam.examName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Closes: {new Date(exam.deadline).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Soon
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border border-white/5 rounded-xl border-dashed">
                <p className="text-sm text-slate-500">No urgent deadlines approaching.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* 5. Notifications */}
        <motion.section variants={fadeInUp} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recent Alerts</h2>
                <p className="text-xs text-slate-400">System and profile updates.</p>
              </div>
            </div>
            <button className="text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 cursor-pointer">
              Clear All
            </button>
          </div>

          <div className="space-y-3">
             {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  <div>
                    <p className="text-sm text-slate-200 leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border border-white/5 rounded-xl border-dashed">
                <p className="text-sm text-slate-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default DashboardHomePage;
