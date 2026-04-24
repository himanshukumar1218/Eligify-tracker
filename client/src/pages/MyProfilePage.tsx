import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEligibilityReadiness } from '../utils/profileReadiness';
import { CheckCircle2, AlertTriangle, Pencil, User, BookOpen, Activity, Briefcase, Award } from 'lucide-react';
import { API_BASE } from '../utils/api';
import Loader from '../components/ui/Loader';

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

type AcademicTimelineItem = {
  level: string; institution: string; meta: string;
  scoreA: string; scoreB: string; verified: boolean; subjects?: string[];
};

type ProfileData = {
  basic: { fullName: string; dob: string; gender: string; category: string; domicile: string; isPwD: 'true' | 'false' | ''; };
  academic: {
    highestQualification: string; tenthBoard: string; tenthPassingYear: string; tenthPercentage: string;
    twelfthBoard: string; twelfthStream: string; twelfthPercentage: string; twelfthPassingYear: string;
    twelfthSubjects: string[]; programme: string; college: string; branch: string; gpa: string; graduationStatus: string;
  };
  physical: { height: string; weight: string; chest: string; };
  experience: { years: string; field: string; };
  certifications: string[];
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="show"
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className={`rounded-[2rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle: React.FC<{ icon: React.FC<any>; eyebrow: string; title: string; subtitle?: string }> = ({ icon: Icon, eyebrow, title, subtitle }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-cyan-400" />
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>
    </div>
    <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
    {subtitle && <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>}
  </div>
);

const DataRow: React.FC<{ label: string; value: string; verified?: boolean }> = ({ label, value, verified = false }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/5 py-4 last:border-b-0 last:pb-0">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value || 'N/A'}</p>
    </div>
    {verified && (
      <span className="mt-1 shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
    )}
  </div>
);

const CheckBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">
    <CheckCircle2 className="h-3.5 w-3.5" /> {text}
  </span>
);

const MyProfilePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academics' | 'professional'>('personal');
  const verificationItems = ['Identity Verified', 'Category Verified'];

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null); setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Could not fetch your profile data.');
        const result = await response.json();
        if (result.exists) {
          setProfile(result.data);
        } else {
          setProfile({
            basic: { fullName: 'Candidate', dob: '', gender: '', category: '', domicile: '', isPwD: '' },
            academic: { highestQualification: '', tenthBoard: '', tenthPassingYear: '', tenthPercentage: '', twelfthBoard: '', twelfthStream: '', twelfthPercentage: '', twelfthPassingYear: '', twelfthSubjects: [], programme: '', college: '', branch: '', gpa: '', graduationStatus: '' },
            physical: { height: '', weight: '', chest: '' },
            experience: { years: '', field: '' },
            certifications: []
          });
          setShowCompletionPopup(true);
        }
      } catch (err) {
        setError("Unable to connect to the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <Loader text="Fetching Profile" />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-rose-200">Something went wrong</h2>
          <p className="mt-2 text-sm text-rose-300/70">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-rose-500 px-6 py-2 text-sm font-bold text-white hover:bg-rose-600 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center text-white">No profile found.</div>;

  const personalDetails = [
    { label: 'Date of Birth', value: formatDate(profile.basic.dob), verified: true },
    { label: 'Gender', value: profile.basic.gender, verified: true },
    { label: 'Category', value: profile.basic.category, verified: true },
    { label: 'Domicile State', value: profile.basic.domicile, verified: true },
    { label: 'PwD Status', value: profile.basic.isPwD === 'true' ? 'Yes' : 'No', verified: false },
  ];

  const academicTimeline: AcademicTimelineItem[] = [];
  academicTimeline.push({ level: '10th Standard', institution: profile.academic.tenthBoard, meta: `Passing Year ${profile.academic.tenthPassingYear || 'N/A'}`, scoreA: `${profile.academic.tenthPercentage || 'N/A'}%`, scoreB: 'Primary Education', verified: true });
  if (['intermediate', 'undergraduate', 'postgraduate'].includes(profile.academic.highestQualification)) {
    academicTimeline.push({ level: '12th Standard', institution: profile.academic.twelfthBoard, meta: profile.academic.twelfthStream, scoreA: `${profile.academic.twelfthPercentage || 'N/A'}%`, scoreB: `Passing Year ${profile.academic.twelfthPassingYear || 'N/A'}`, verified: true, subjects: profile.academic.twelfthSubjects });
  }
  if (['diploma', 'undergraduate', 'postgraduate'].includes(profile.academic.highestQualification)) {
    const gpaValue = Number(profile.academic.gpa);
    const pct = !Number.isNaN(gpaValue) && gpaValue > 0 ? `${(gpaValue * 10).toFixed(0)}%` : 'N/A';
    academicTimeline.push({ level: profile.academic.programme || 'Degree / Diploma', institution: profile.academic.college, meta: profile.academic.branch, scoreA: `${profile.academic.gpa || 'N/A'} GPA`, scoreB: pct, verified: true });
  }

  const physicalStats = [
    { label: 'Height', value: profile.physical.height, unit: 'cm' },
    { label: 'Weight', value: profile.physical.weight, unit: 'kg' },
    { label: 'Chest', value: profile.physical.chest, unit: 'cm' },
  ];

  const initials = profile.basic.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const calculateStrength = () => {
    const baseFields = [profile.basic.fullName, profile.basic.dob, profile.basic.gender, profile.basic.category, profile.basic.domicile, profile.academic.highestQualification, profile.academic.tenthBoard, profile.academic.tenthPercentage, profile.physical.height, profile.experience.field];
    let scoreCount = baseFields.filter(Boolean).length;
    const isIntermediate = ['intermediate', 'undergraduate', 'postgraduate'].includes(profile.academic.highestQualification);
    if (isIntermediate) { if (profile.academic.twelfthSubjects?.length > 0) scoreCount += 1; } else { scoreCount += 1; }
    return Math.min(100, Math.round((scoreCount / 11) * 100));
  };

  const profileStrength = calculateStrength();
  const eligibilityReadiness = getEligibilityReadiness(profile);

  const strengthColor = profileStrength === 100 ? 'from-emerald-400 to-teal-400' : profileStrength >= 75 ? 'from-cyan-400 to-blue-500' : profileStrength >= 40 ? 'from-blue-400 to-violet-500' : 'from-amber-400 to-orange-500';

  return (
    <div className="relative space-y-4 pb-24">
      {/* Unified Profile Header */}
      <motion.section
        variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] border border-cyan-500/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-[0_25px_60px_rgba(2,6,23,0.6)] sm:p-6"
      >
        {/* Compact Layout for New Users */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 blur-lg opacity-40" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-xl font-bold text-white">
                {initials || <User className="h-6 w-6" />}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile.basic.fullName || 'Candidate'}</h1>
              {!eligibilityReadiness.isReady ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Action Required: Profile Incomplete</p>
                </div>
              ) : (
                <div className="mt-1 flex gap-2">
                   {verificationItems.map(item => <CheckBadge key={item} text={item} />)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Minimal Strength Indicator */}
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Strength</p>
                <p className={`text-lg font-bold bg-gradient-to-r ${strengthColor} bg-clip-text text-transparent`}>{profileStrength}%</p>
              </div>
              <div className="h-8 w-[2px] bg-white/5" />
              {!eligibilityReadiness.isReady ? (
                <Link to="/student-details" className="flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-[10px] font-bold text-slate-950 hover:bg-amber-200">
                  Finish Now
                </Link>
              ) : (
                <Link to="/student-details" className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[10px] font-bold text-white hover:bg-white/20">
                  <Pencil className="h-3 w-3" /> Edit
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.section>


      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden overflow-x-auto no-scrollbar rounded-2xl border border-white/5 bg-slate-900/40 p-1.5 backdrop-blur-md">
        {[
          { id: 'personal', label: 'Personal', icon: User },
          { id: 'academics', label: 'Academics', icon: BookOpen },
          { id: 'professional', label: 'Professional', icon: Briefcase },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id 
                ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/30' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.7fr]">
        {/* Left Column (Personal & Physical) */}
        <div className={`space-y-6 ${activeTab === 'personal' ? 'block' : 'hidden lg:block'}`}>
          {/* Personal Profile */}
          <GlassCard delay={0.2} className="p-6">
            <SectionTitle icon={User} eyebrow="Personal" title="Personal Profile" subtitle="Core identity attributes used by eligibility filters." />
            <div>
              {personalDetails.map(item => <DataRow key={item.label} label={item.label} value={item.value} verified={item.verified} />)}
            </div>
          </GlassCard>

          {/* Physical Standards */}
          <GlassCard delay={0.25} className="p-6">
            <SectionTitle icon={Activity} eyebrow="Physical" title="Physical Standards" subtitle="Values used for role-specific physical eligibility." />
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {physicalStats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-slate-950/60 px-5 py-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                  <div className="mt-3 flex items-end justify-center gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white">{stat.value || 'N/A'}</span>
                    <span className="pb-1 text-sm text-slate-500">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column (Academics & Professional) */}
        <div className="space-y-6">
          {/* Academic Timeline */}
          <div className={activeTab === 'academics' ? 'block' : 'hidden lg:block'}>
            <GlassCard delay={0.3} className="p-6">
              <SectionTitle icon={BookOpen} eyebrow="Academics" title="Academic Timeline" subtitle="Qualification history used to evaluate exam eligibility." />
              <div className="space-y-5">
                {academicTimeline.map((item, index) => (
                  <div key={`${item.level}-${index}`} className="relative pl-10">
                    {index !== academicTimeline.length - 1 && (
                      <div className="absolute left-[14px] top-10 h-[calc(100%-10px)] w-px bg-gradient-to-b from-cyan-500/30 to-transparent" />
                    )}
                    {/* Timeline Node */}
                    <div className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center">
                      <div className="absolute h-full w-full rounded-full bg-cyan-500/20 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                      <div className="relative h-5 w-5 rounded-full border border-cyan-500/40 bg-cyan-600/20 shadow-[0_0_12px_rgba(34,211,238,0.3)]" />
                    </div>
                    {/* Card */}
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-white/8 bg-slate-800/40 p-5 hover:border-cyan-500/20 hover:bg-slate-800/60 transition-all"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-white">{item.level}</h3>
                            {item.verified && <CheckBadge text="Verified" />}
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-300">{item.institution || 'N/A'}</p>
                          <p className="mt-0.5 text-sm text-slate-500">{item.meta || 'N/A'}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 shrink-0">
                          <div className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 min-w-[100px]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Primary Score</p>
                            <p className="mt-1.5 text-lg font-bold text-white">{item.scoreA}</p>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 min-w-[100px]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.level === '12th Standard' ? 'Passing Year' : 'Secondary'}</p>
                            <p className="mt-1.5 text-lg font-bold text-white">{item.scoreB}</p>
                          </div>
                        </div>
                      </div>
                      {item.subjects?.length ? (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 mb-3">Standardized Subjects</p>
                          <div className="flex flex-wrap gap-2">
                            {item.subjects.map(subject => (
                              <span key={subject} className="rounded-full border border-blue-500/20 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-200">{subject}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Experience & Certifications */}
          <div className={activeTab === 'professional' ? 'block' : 'hidden lg:block'}>
            <GlassCard delay={0.35} className="p-6">
              <SectionTitle icon={Briefcase} eyebrow="Professional" title="Experience & Certifications" subtitle="Supplemental qualification signals for technical and service roles." />
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-cyan-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Experience</p>
                  </div>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight text-white">{profile.experience.years || '0'}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">years</p>
                  <p className="mt-3 text-sm text-slate-400">Field: <span className="text-slate-200 font-medium">{profile.experience.field || 'Not specified'}</span></p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-cyan-400" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Certifications</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications?.length ? (
                      profile.certifications.map(cert => (
                        <span key={cert} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">{cert}</span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No certifications added yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* FAB - Edit Details */}
      <Link
        to="/student-details"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.35)] transition-all hover:scale-105 hover:shadow-[0_12px_40px_rgba(34,211,238,0.5)]"
      >
        <Pencil className="h-4 w-4" /> Edit Details
      </Link>

      {/* Completion Popup */}
      {showCompletionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_40px_100px_rgba(2,6,23,0.8)]"
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/20">
                <User className="h-7 w-7 text-cyan-400" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold tracking-tight text-white">Complete Your Profile</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">Add your personal and academic details so we can automatically match you with government exams you are eligible for. This only takes 2–3 minutes.</p>
              <div className="mt-8 flex flex-col gap-3">
                <Link to="/student-details" className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-bold text-slate-950 transition-all hover:scale-105">
                  Complete Profile
                </Link>
                <button onClick={() => setShowCompletionPopup(false)} className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5">
                  Remind Me Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
