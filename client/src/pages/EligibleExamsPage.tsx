import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import EligibilityDrawer, { type ExamData, type EligibilityReason } from '../components/dashboard/EligibilityDrawer';

const statusStyles: Record<string, string> = {
  Eligible: 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  'Near Match': 'border border-amber-400/20 bg-amber-400/10 text-amber-200',
  'Closing Soon': 'border border-rose-400/20 bg-rose-400/10 text-rose-200',
  'Upcoming': 'border border-blue-400/20 bg-blue-400/10 text-blue-200',
};

type MissingField = {
  key: string;
  label: string;
};

type ExamRow = ExamData & {
  postId: number;
  deadline: string;
  timingStatus: string;
  url?: string;
  applyUrl?: string;
  examUrl?: string;
};

type EligibleExamsData = {
  eligibleCount: number;
  nearMatchCount: number;
  eligible: ExamRow[];
  nearMatches: ExamRow[];
};

type EligibleExamsResponse =
  | {
      success: true;
      data: EligibleExamsData;
    }
  | {
      success: false;
      code?: string;
      message?: string;
      missingFields?: MissingField[];
    };

type IncompleteProfileResponse = Extract<EligibleExamsResponse, { success: false }>;

const formatReasonSummary = (reason: EligibilityReason) => reason.message;

const EligibleExamsPage: React.FC = () => {
  const [data, setData] = useState<EligibleExamsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eligible' | 'nearMatches'>('eligible');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState<{
    message: string;
    missingFields: MissingField[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/exams/eligible', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result: EligibleExamsResponse = await res.json();

        if (result.success) {
          setData(result.data);
          setProfileIncomplete(null);
          setErrorMessage('');
          return;
        }

        const errorResult = result as IncompleteProfileResponse;

        if (errorResult.code === 'PROFILE_INCOMPLETE') {
          setProfileIncomplete({
            message: errorResult.message || 'Complete your profile to get accurate eligibility results.',
            missingFields: errorResult.missingFields || [],
          });
          setData(null);
          setErrorMessage('');
          return;
        }

        setErrorMessage(errorResult.message || 'Unable to load eligibility results right now.');
      } catch (err) {
        console.error("Failed to fetch exams", err);
        setErrorMessage('Unable to load eligibility results right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const currentExams = activeTab === 'eligible' ? data?.eligible : data?.nearMatches;

  const filteredExams = useMemo(() => {
    if (!currentExams) return [];
    return currentExams.filter((exam: any) => {
      const examNameStr = String(exam.examName || '').toLowerCase();
      const postNameStr = String(exam.postName || '').toLowerCase();
      const orgStr = String(exam.organisation || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      
      const matchSearch = examNameStr.includes(q) || postNameStr.includes(q) || orgStr.includes(q);
      const matchStatus = statusFilter === 'All' || exam.timingStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [currentExams, searchQuery, statusFilter]);

  if (loading) return <div className="p-10 text-white animate-pulse uppercase tracking-widest">Scanning Eligibility...</div>;

  if (profileIncomplete) {
    return (
      <section className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">Eligibility Engine</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Complete your profile first</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          {profileIncomplete.message}
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profileIncomplete.missingFields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-amber-100"
            >
              {field.label}
            </div>
          ))}
        </div>
        <Link
          to="/student-details"
          className="mt-6 inline-flex items-center rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
        >
          Go to student details
        </Link>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Unable to load matched opportunities</h1>
        <p className="mt-3 text-sm leading-7">{errorMessage}</p>
      </section>
    );
  }



  return (
    <div className="space-y-6">
      {/* 1. Dynamic Stats Cards */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Eligibility Engine</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Matched Opportunities</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              We've scanned active exams against your profile. You have <strong>{data?.eligibleCount}</strong> direct matches.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setActiveTab('eligible')}
              className={`group rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer hover:scale-[1.02] ${activeTab === 'eligible' ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <p className="text-sm text-slate-400 transition-colors group-hover:text-slate-300">Eligible to Apply</p>
              <p className="mt-2 text-2xl font-semibold text-white transition-transform group-hover:translate-x-1">{data?.eligibleCount || 0}</p>
            </button>
            <button
              onClick={() => setActiveTab('nearMatches')}
              className={`group rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer hover:scale-[1.02] ${activeTab === 'nearMatches' ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <p className="text-sm text-slate-400 transition-colors group-hover:text-slate-300">Near Matches</p>
              <p className="mt-2 text-2xl font-semibold text-white transition-transform group-hover:translate-x-1">{data?.nearMatchCount || 0}</p>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Exam Table */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input 
              type="text" 
              placeholder="Search by exam, post, organisation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming (Opening Soon)</option>
              <option value="Active">Active (Applications Open)</option>
              <option value="Closed">Closed</option>
            </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-slate-950/80">
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-4 py-4">Exam & Post</th>
                <th className="px-4 py-4">Organisation</th>
                <th className="px-4 py-4">Deadline</th>
                <th className="px-4 py-4">Status / Review</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-900/40">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No exams match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam: any) => (
                  <tr key={exam.postId} className="text-sm text-slate-300 group hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{exam.examName}</p>
                      <p className="text-xs text-slate-500 uppercase mt-1">{exam.postName}</p>
                    </td>
                    <td className="px-4 py-4 font-medium">{exam.organisation}</td>
                    <td className="px-4 py-4">{new Date(exam.deadline).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-3">
                        {/* 1. Eligibility Status */}
                        {activeTab === 'eligible' ? (
                          <span className={statusStyles.Eligible + " inline-flex rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest"}>
                            Ready to Apply
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <button 
                              onClick={() => {
                                setSelectedExam(exam);
                                setIsDrawerOpen(true);
                              }}
                              className={statusStyles['Near Match'] + " inline-flex rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:brightness-125 hover:scale-105 transition-all text-left w-max"}
                            >
                              Review Criteria
                            </button>
                            {exam.reasons.map((r: any, i: number) => (
                              <p key={i} className="text-[10px] text-amber-200/60 lowercase italic leading-relaxed">
                                ↳ {formatReasonSummary(r)}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* 2. Live Timing Status */}
                        <div className="flex items-center gap-1.5 px-1">
                          {exam.timingStatus === 'Upcoming' ? (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                                Opening Soon
                              </span>
                            </>
                          ) : exam.timingStatus === 'Closed' ? (
                            <div className="flex items-center gap-1.5 px-1">
                              <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Closed
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                                Applications Open
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          const link = exam.url || exam.applyUrl || exam.examUrl;
                          if (link) {
                            window.open(link, '_blank', 'noopener,noreferrer');
                          } else {
                            console.warn('No URL provided for this exam.');
                          }
                        }}
                        disabled={exam.timingStatus === 'Upcoming' || exam.timingStatus === 'Closed'}
                        className={[
                          'w-full rounded-xl border px-4 py-2 text-xs font-bold uppercase transition-all duration-300',
                          exam.timingStatus === 'Upcoming'
                            ? 'border-white/5 bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                            : exam.timingStatus === 'Closed'
                            ? 'border-white/5 bg-slate-900/50 text-slate-600 cursor-not-allowed opacity-50'
                            : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 cursor-pointer hover:bg-cyan-400/20 hover:text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        ].join(' ')}
                      >
                        {exam.timingStatus === 'Upcoming' ? 'Stay Tuned' : exam.timingStatus === 'Closed' ? 'Closed' : 'Apply Now'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Breakout Drawer */}
      <EligibilityDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        exam={selectedExam}
      />
    </div>
  );
};

export default EligibleExamsPage;
