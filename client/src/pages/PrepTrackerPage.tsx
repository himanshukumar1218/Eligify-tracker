import React, { useState, useEffect } from 'react';
import { API_BASE as _API_BASE } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Target, ListChecks, Trash2, Plus,
  CalendarDays, NotebookPen, Flame, Trophy,
  CheckCircle2, Circle, Zap, Save, FileText
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

interface ExamData {
  id: number;
  exam_name: string;
  organisation: string | null;
  sector: string | null;
  status: string;
}

interface PrepStats {
  total: number;
  completed: number;
  activityMap: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

interface DailyNote {
  id: number;
  note_date: string;
  content: string;
  updated_at: string;
}

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function getCalendarDays(): string[] {
  const days: string[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 83); // 12 weeks
  const cur = new Date(start);
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ExamSelector: React.FC<{
  exams: ExamData[];
  selected: number | null;
  onChange: (id: number) => void;
  loading?: boolean;
}> = ({ exams, selected, onChange, loading = false }) => {
  const [open, setOpen] = useState(false);
  const current = exams.find(e => e.id === selected);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm text-slate-500 animate-pulse">
        <Zap className="h-4 w-4" />
        <span>Loading exams…</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full sm:min-w-[18rem] max-w-md items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] focus:outline-none"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <Zap className="h-4 w-4 shrink-0 text-cyan-400" />
          <span className="truncate">{current?.exam_name ?? 'Select Exam'}</span>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 sm:right-auto sm:left-0 top-full z-50 mt-2 w-full sm:w-[450px] max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/80 custom-scrollbar"
          >
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => { onChange(exam.id); setOpen(false); }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-800/80 ${
                  exam.id === selected ? 'text-cyan-400 font-semibold bg-slate-800/40' : 'text-slate-300'
                }`}
              >
                <div className="pt-0.5">
                  {exam.id === selected
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                    : <Circle className="h-4 w-4 shrink-0 text-slate-600" />}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-2 leading-relaxed">{exam.exam_name}</p>
                  {exam.sector && (
                    <span className="mt-1.5 inline-block text-[10px] text-slate-400 font-medium bg-slate-800/80 border border-white/5 px-2 py-0.5 rounded-full">
                      {exam.sector}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {exams.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No active exams found.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProgressRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = "stroke-slate-600 drop-shadow-none";
  let textClass = "text-slate-500";

  if (percentage === 100) {
    colorClass = "stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]";
    textClass = "text-emerald-400";
  } else if (percentage >= 75) {
    colorClass = "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]";
    textClass = "text-cyan-400";
  } else if (percentage >= 40) {
    colorClass = "stroke-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]";
    textClass = "text-blue-400";
  } else if (percentage > 0) {
    colorClass = "stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]";
    textClass = "text-amber-400";
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r={radius}
          className="stroke-slate-800"
          strokeWidth="8"
          fill="transparent"
        />
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          className={`${colorClass} transition-colors duration-700`}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-extrabold ${percentage === 100 ? 'text-emerald-400' : 'text-white'} transition-colors duration-700`}>{percentage}</span>
        <span className={`text-[10px] font-bold ${textClass} transition-colors duration-700`}>%</span>
      </div>
    </div>
  );
};

const ProgressCard: React.FC<{ stats: PrepStats }> = ({ stats }) => {
  const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="relative flex items-center justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
      
      <div className="flex-1 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Mastery</h2>
        </div>
        <p className="text-sm text-slate-300 mt-2">
          Completed <span className="font-bold text-white">{stats.completed}</span> out of <span className="font-bold text-white">{stats.total}</span> milestones.
        </p>
      </div>
      
      <div className="shrink-0 ml-4 z-10">
        <ProgressRing percentage={pct} />
      </div>
    </motion.div>
  );
};

const StatsCard: React.FC<{ title: string; value: string; icon: React.FC<any>; color: string }> = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col items-center justify-center h-full"
  >
    <div className={`absolute inset-0 opacity-10 blur-[40px] pointer-events-none ${color.replace('text-', 'bg-')}`}></div>
    <Icon className={`h-8 w-8 mb-3 ${color}`} />
    <p className={`text-3xl font-extrabold mb-1 ${color}`}>{value}</p>
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center">{title}</p>
  </motion.div>
);

const ActivityCalendar: React.FC<{ activityMap: Record<string, number> }> = ({ activityMap }) => {
  const calendarDays = getCalendarDays();
  const todayStr = today();

  const getColor = (day: string) => {
    const count = activityMap[day] ?? 0;
    if (count === 0) return 'bg-slate-800/40 border border-white/5';
    if (count === 1) return 'bg-cyan-900/80 border border-cyan-500/20';
    if (count === 2) return 'bg-cyan-600 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]';
    return 'bg-cyan-400 border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]';
  };

  const weeks: string[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 lg:p-8 backdrop-blur-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Study Activity</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center overflow-x-auto custom-scrollbar pb-2">
        <div className="flex gap-1.5 min-w-max mx-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map(day => (
                <div key={day} className="group relative">
                  <div
                    className={`h-4 w-4 rounded-[4px] transition-all duration-300 hover:scale-125 ${getColor(day)} ${day === todayStr ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-slate-900' : ''}`}
                  />
                  {/* Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 bg-slate-800 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10">
                    <span className="font-semibold text-cyan-400">{activityMap[day] ?? 0}</span> tasks on {new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-2 text-[11px] font-medium text-slate-400 w-full max-w-max mx-auto">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="h-3.5 w-3.5 rounded-[3px] bg-slate-800/40 border border-white/5" />
            <div className="h-3.5 w-3.5 rounded-[3px] bg-cyan-900/80 border border-cyan-500/20" />
            <div className="h-3.5 w-3.5 rounded-[3px] bg-cyan-600 border border-cyan-400/30" />
            <div className="h-3.5 w-3.5 rounded-[3px] bg-cyan-400 border border-cyan-300" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

const TaskList: React.FC<{
  tasks: Task[];
  onAdd: (title: string, dueDate: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isAdding?: boolean;
}> = ({ tasks, onAdd, onToggle, onDelete, isAdding = false }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newDue);
    setNewTitle('');
    setNewDue('');
  };

  const todayDate = today();

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 lg:p-8 backdrop-blur-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Action Items</h2>
        <span className="ml-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400">
          {tasks.filter(t => !t.completed).length} pending
        </span>
      </div>

      {/* Add Task Input */}
      <div className="relative mb-6 flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Plus className="h-5 w-5 text-cyan-500/50" />
        </div>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="w-full rounded-2xl border border-white/10 bg-slate-800/40 pl-12 pr-32 py-4 text-sm text-white placeholder-slate-500 outline-none focus:bg-slate-800/80 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-2">
          <input
            type="date"
            value={newDue}
            onChange={e => setNewDue(e.target.value)}
            className="w-32 rounded-xl bg-transparent px-2 py-2 text-xs text-slate-400 outline-none hover:text-cyan-400 focus:text-cyan-400 transition-colors [color-scheme:dark] cursor-pointer"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || !newTitle.trim()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        <AnimatePresence>
          {tasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-slate-500"
            >
              <ListChecks className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Your task list is beautifully empty.</p>
            </motion.div>
          )}
          {tasks.map(task => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayDate;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 ${
                  task.completed
                    ? 'border-white/5 bg-slate-800/20'
                    : isOverdue 
                      ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                      : 'border-white/10 bg-slate-800/40 hover:border-white/20 hover:bg-slate-800/60 hover:shadow-lg'
                }`}
              >
                <button
                  onClick={() => onToggle(task.id)}
                  className="shrink-0 transition-transform hover:scale-110 focus:outline-none"
                >
                  {task.completed
                    ? <CheckCircle2 className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    : <Circle className={`h-6 w-6 ${isOverdue ? 'text-rose-400' : 'text-slate-500'} hover:text-cyan-400/60`} />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate transition-all duration-300 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                </div>

                {task.dueDate && (
                  <span className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${
                    isOverdue && !task.completed
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : task.completed
                        ? 'bg-slate-800/50 text-slate-500 border-transparent'
                        : 'bg-slate-800 text-slate-400 border-white/5'
                  }`}>
                    <CalendarDays className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}

                <button
                  onClick={() => onDelete(task.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 focus:outline-none"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DailyNotesSection: React.FC<{
  notes: DailyNote[];
  onSaveToday: (content: string) => Promise<void>;
}> = ({ notes, onSaveToday }) => {
  const [todayDraft, setTodayDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const todayStr = today();

  const todayNote = notes.find(n => new Date(n.note_date).toISOString().split('T')[0] === todayStr);
  const pastNotes = notes.filter(n => new Date(n.note_date).toISOString().split('T')[0] !== todayStr);

  useEffect(() => {
    if (todayNote) setTodayDraft(todayNote.content);
    else setTodayDraft('');
  }, [todayNote]);

  const handleSave = async () => {
    if (!todayDraft.trim()) return;
    setIsSaving(true);
    await onSaveToday(todayDraft);
    setIsSaving(false);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 lg:p-8 backdrop-blur-xl h-full flex flex-col relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <NotebookPen className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Daily Logs</h2>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        {/* Today's Entry */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Today
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving || todayDraft === (todayNote?.content ?? '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30"
            >
              {isSaving ? <Zap className="h-3.5 w-3.5 animate-pulse" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
          </div>
          <textarea
            value={todayDraft}
            onChange={e => setTodayDraft(e.target.value)}
            placeholder="Log your study strategies, learned concepts, or reflections for today..."
            className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-slate-800/40 p-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:bg-slate-800/80 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-y leading-relaxed"
          />
        </div>

        {/* Past Entries */}
        {pastNotes.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Previous Logs
            </h3>
            {pastNotes.map(note => (
              <div key={note.id} className="rounded-2xl border border-white/5 bg-slate-800/30 p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">
                  {new Date(note.note_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const API_BASE = `${_API_BASE}/api/users`;
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const PrepTrackerPage: React.FC = () => {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examsLoading, setExamsLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<PrepStats>({ total: 0, completed: 0, activityMap: {}, currentStreak: 0, longestStreak: 0 });
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // 1. Fetch Exams
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/preptracker/exams`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(({ data }) => {
        if (cancelled) return;
        setExams(data ?? []);
        if (data?.length > 0) setSelectedExam(data[0].id);
      })
      .finally(() => { if (!cancelled) setExamsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // 2. Fetch Data when Exam changes
  const fetchData = async (examId: number) => {
    try {
      const headers = getAuthHeaders();
      const [tasksRes, statsRes, notesRes] = await Promise.all([
        fetch(`${API_BASE}/preptracker/tasks?examId=${examId}`, { headers }),
        fetch(`${API_BASE}/preptracker/stats?examId=${examId}`, { headers }),
        fetch(`${API_BASE}/preptracker/daily-notes?examId=${examId}`, { headers })
      ]);

      const tasksData = await tasksRes.json();
      const statsData = await statsRes.json();
      const notesData = await notesRes.json();

      setTasks((tasksData.data ?? []).map((t: any) => ({
        id: String(t.id), title: t.title, dueDate: t.due_date ?? '',
        completed: t.completed ?? false, completedAt: t.completed_at
      })));
      if (statsData.success) setStats(statsData.data);
      if (notesData.success) setNotes(notesData.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedExam != null) fetchData(selectedExam);
  }, [selectedExam]);

  // Actions
  const handleAddTask = async (title: string, dueDate: string) => {
    if (selectedExam == null) return;
    setIsAdding(true);
    try {
      await fetch(`${API_BASE}/preptracker/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ examId: selectedExam, title, dueDate: dueDate || null }),
      });
      await fetchData(selectedExam); // Refresh data (tasks + stats)
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    if (selectedExam == null) return;
    // Optimistic UI for snappy feel
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await fetch(`${API_BASE}/preptracker/tasks/${id}/toggle`, {
        method: 'PATCH', headers: getAuthHeaders()
      });
      fetchData(selectedExam); // Sync in background to update stats & circular progress
    } catch (err) {
      fetchData(selectedExam); // Rollback on error
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (selectedExam == null) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_BASE}/preptracker/tasks/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      fetchData(selectedExam);
    } catch (err) {
      fetchData(selectedExam);
    }
  };

  const handleSaveDailyNote = async (content: string) => {
    if (selectedExam == null) return;
    const noteDate = today();
    try {
      await fetch(`${API_BASE}/preptracker/daily-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ examId: selectedExam, noteDate, content }),
      });
      fetchData(selectedExam);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Prep Tracker</h1>
          <p className="mt-1 text-sm text-slate-400">Master your preparation with powerful daily tracking.</p>
        </div>
        <ExamSelector exams={exams} selected={selectedExam} onChange={setSelectedExam} loading={examsLoading} />
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Top Row: Progress & Streaks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-12 xl:col-span-6">
          <ProgressCard stats={stats} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-1 md:col-span-6 xl:col-span-3">
          <StatsCard title="Current Streak" value={`${stats.currentStreak} Days`} icon={Flame} color="text-orange-400" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-1 md:col-span-6 xl:col-span-3">
          <StatsCard title="Longest Streak" value={`${stats.longestStreak} Days`} icon={Trophy} color="text-amber-400" />
        </motion.div>

        {/* Middle Row: Tasks & Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-1 md:col-span-12 xl:col-span-7 h-[600px]">
          <TaskList tasks={tasks} onAdd={handleAddTask} onToggle={handleToggleTask} onDelete={handleDeleteTask} isAdding={isAdding} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-1 md:col-span-12 xl:col-span-5 h-[600px]">
          <DailyNotesSection notes={notes} onSaveToday={handleSaveDailyNote} />
        </motion.div>

        {/* Bottom Row: Activity Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-1 md:col-span-12">
          <ActivityCalendar activityMap={stats.activityMap} />
        </motion.div>

      </div>
    </div>
  );
};

export default PrepTrackerPage;
