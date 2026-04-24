import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, GraduationCap, Award, Briefcase, Activity, FileText } from 'lucide-react';
import { API_BASE } from './utils/api';
import * as types from '@shared/constants/eligibilityConstants';
const {
  CATEGORIES,
  GENDERS,
  GRADUATION_STATUSES,
  QUALIFICATION_LEVELS,
  CERTIFICATION_OPTIONS: certificationOptions,
  EXPERIENCE_FIELDS: experienceFields,
  BOARD_OPTIONS: boardOptions,
  TWELFTH_SUBJECTS_OPTIONS: twelfthSubjectsOptions,
  COURSES_DATA: coursesData,
} = ((types as any).default || types) as typeof types;
import { getEligibilityReadiness } from './utils/profileReadiness';
import Loader from './components/ui/Loader';
import CustomDropdown from './components/ui/CustomDropdown';

type Qualification = (typeof QUALIFICATION_LEVELS)[number];
type Gender = (typeof GENDERS)[number];
type GraduationStatus = (typeof GRADUATION_STATUSES)[number];

type BasicDetails = {
  fullName: string;
  dob: string;
  phone: string;
  gender: Gender | '';
  category: string;
  isPwD: 'true' | 'false' | '';
  district: string;
  domicile: string;
  nationality: string;
  pinCode: string;
};

type AcademicDetails = {
  highestQualification: Qualification | '';
  tenthBoard: string;
  tenthPercentage: string;
  tenthPassingYear: string;
  twelfthBoard: string;
  twelfthStream: string;
  twelfthSubjects: string[];
  twelfthPercentage: string;
  twelfthPassingYear: string;
  diplomaPercentage: string;
  graduationStatus: GraduationStatus | '';
  programme: string;
  branch: string;
  college: string;
  gpa: string;
  ugProgramme: string;
  ugBranch: string;
  ugCollege: string;
  ugPassingYear: string;
  ugPercentage: string;
};

type ExperienceDetails = {
  hasExperience: 'true' | 'false' | '';
  years: string;
  field: string;
};

type PhysicalDetails = {
  height: string;
  weight: string;
  chest: string;
  isPhysicalFit: 'true' | 'false' | '';
};

type OtherDetails = {
  isExServiceman: null;
};

type FormData = {
  basic: BasicDetails;
  academic: AcademicDetails;
  certifications: string[];
  experience: ExperienceDetails;
  physical: PhysicalDetails;
  other: OtherDetails;
};

type LookupState = {
  loading: boolean;
  error: string;
};

// certificationOptions, experienceFields, boardOptions, twelfthSubjectsOptions are now imported from @shared

const OTHER_OPTION = '__other__';
const genderOptions: Array<{ value: Gender; label: string }> = GENDERS.map(g => ({
  value: g,
  label: g.charAt(0).toUpperCase() + g.slice(1).replace(/_/g, ' ')
}));

const categoryOptions: Array<{ value: (typeof CATEGORIES)[number]; label: string }> = [
  { value: 'UR', label: 'General (UR)' },
  { value: 'OBC', label: 'OBC (Non-Creamy Layer)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' },
  { value: 'EWS', label: 'Economically Weaker Section (EWS)' },
];

const qualificationOptions: Array<{ value: Qualification; label: string }> = [
  { value: 'secondary', label: '10th Pass' },
  { value: 'intermediate', label: '12th Pass' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Post Graduate' },
];

const initialFormData: FormData = {
  basic: {
    fullName: '',
    dob: '',
    phone: '',
    gender: '',
    category: '',
    isPwD: '',
    district: '',
    domicile: '',
    nationality: 'Indian',
    pinCode: '',
  },
  academic: {
    highestQualification: '',
    tenthBoard: '',
    tenthPercentage: '',
    tenthPassingYear: '',
    twelfthBoard: '',
    twelfthStream: '',
    twelfthSubjects: [],
    twelfthPercentage: '',
    twelfthPassingYear: '',
    diplomaPercentage: '',
    programme: '',
    branch: '',
    graduationStatus: '',
    college: '',
    gpa: '',
    ugProgramme: '',
    ugBranch: '',
    ugCollege: '',
    ugPassingYear: '',
    ugPercentage: '',
  },
  certifications: [],
  experience: { hasExperience: '', years: '', field: '' },
  physical: { height: '', weight: '', chest: '', isPhysicalFit: '' },
  other: { isExServiceman: null },
};

const stepTitles = [
  { eyebrow: 'Step 1', title: 'Basic Info', subtitle: 'Personal Identity', icon: UserCircle },
  { eyebrow: 'Step 2', title: 'Education', subtitle: 'Detailed Academics', icon: GraduationCap },
  { eyebrow: 'Step 3', title: 'Certifications', subtitle: 'Skills & Licenses', icon: Award },
  { eyebrow: 'Step 4', title: 'Experience', subtitle: 'Work History', icon: Briefcase },
  { eyebrow: 'Step 5', title: 'Physical', subtitle: 'Physical Standards', icon: Activity },
  { eyebrow: 'Step 6', title: 'Other', subtitle: 'Final Details', icon: FileText },
];

const inputClasses =
  'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20';

const labelClasses =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400';

const cardClasses =
  'rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur';

const Field = ({
  label,
  htmlFor,
  helper,
  span = 1,
  children,
}: {
  label: string;
  htmlFor?: string;
  helper?: React.ReactNode;
  span?: 1 | 2;
  children: React.ReactNode;
}) => (
  <div className={span === 2 ? 'md:col-span-2' : ''}>
    <label htmlFor={htmlFor} className={labelClasses}>
      {label}
    </label>
    {children}
    {helper ? <div className="mt-2 text-xs text-slate-400">{helper}</div> : null}
  </div>
);

const StudentDetailFormDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [profileLoading, setProfileLoading] = useState(true);
  const [lookupState, setLookupState] = useState<LookupState>({
    loading: false,
    error: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');
  const [customSelections, setCustomSelections] = useState<Record<string, boolean>>({});

  const qualification = formData.academic.highestQualification;
  const eligibilityReadiness = useMemo(
    () => getEligibilityReadiness(formData),
    [formData]
  );

  const updateField = (section: keyof FormData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const handleInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value },
    }));
  };

  const toggleCert = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => {
      const currentSubjects = prev.academic.twelfthSubjects;
      const nextSubjects = currentSubjects.includes(subject)
        ? currentSubjects.filter((s) => s !== subject)
        : [...currentSubjects, subject];

      return {
        ...prev,
        academic: { ...prev.academic, twelfthSubjects: nextSubjects },
      };
    });
  };

  const setCustomSelection = (field: string, enabled: boolean) => {
    setCustomSelections((prev) => ({ ...prev, [field]: enabled }));
  };

  const getSelectValue = (value: string, options: string[], field: string) => {
    if (options.includes(value)) return value;
    if (customSelections[field] || value) return OTHER_OPTION;
    return '';
  };

  const shouldShowCustomInput = (value: string, options: string[], field: string) =>
    customSelections[field] || (!!value && !options.includes(value));

  const handleAcademicSelectWithOther = (field: string, value: string) => {
    if (value === OTHER_OPTION) {
      setCustomSelection(field, true);
      updateField('academic', field, '');
      return;
    }

    setCustomSelection(field, false);
    updateField('academic', field, value);
  };

  // ── Prefill existing profile on mount ────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setProfileLoading(false); return; }
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          setFormData(json.data as FormData);
        }
      } catch {
        // silently ignore – user just starts fresh
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Postal-code → district/state lookup ──────────────────────────
  useEffect(() => {
    const pin = formData.basic.pinCode.trim();
    if (pin.length !== 6) return;

    const fetchLoc = async () => {
      setLookupState({ loading: true, error: '' });
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          handleInputChange('basic', 'district', data[0].PostOffice[0].District);
          handleInputChange('basic', 'domicile', data[0].PostOffice[0].State);
        }
      } catch (err) {
        setLookupState({ loading: false, error: 'Manual entry' });
      } finally {
        setLookupState({ loading: false, error: '' });
      }
    };
    fetchLoc();
  }, [formData.basic.pinCode]);

  const visibleAcademicFields = useMemo(() => {
    const qual = formData.academic.highestQualification;
    if (!qual) return [];

    const sharedFields = ['tenthBoard', 'tenthPercentage', 'tenthPassingYear'];

    switch (qual) {
      case 'secondary':
        return sharedFields;
      case 'intermediate':
        return [
          ...sharedFields,
          'twelfthBoard',
          'twelfthStream',
          'twelfthSubjects',
          'twelfthPercentage',
          'twelfthPassingYear',
        ];
      case 'diploma':
        return [...sharedFields, 'diplomaPercentage', 'programme', 'branch', 'college', 'gpa'];
      case 'undergraduate':
        return [
          ...sharedFields,
          'twelfthBoard',
          'twelfthStream',
          'twelfthSubjects',
          'twelfthPercentage',
          'twelfthPassingYear',
          'programme',
          'branch',
          'graduationStatus',
          'college',
          'gpa',
        ];
      case 'postgraduate':
        return [
          ...sharedFields,
          'twelfthBoard',
          'twelfthStream',
          'twelfthSubjects',
          'twelfthPercentage',
          'twelfthPassingYear',
          'programme', // Maps to PG Programme
          'branch',    // Maps to PG Branch
          'graduationStatus',
          'college',
          'gpa',
          'ugProgramme',
          'ugBranch',
          'ugCollege',
          'ugPassingYear',
          'ugPercentage'
        ];
      default:
        return [];
    }
  }, [formData.academic.highestQualification]);

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        // Now only strictly requires Name, DOB, and Phone
        return Boolean(
          formData.basic.fullName &&
          formData.basic.dob &&
          formData.basic.phone.trim().length >= 10
        );

      case 1:
        // Only require Highest Qualification
        return Boolean(formData.academic.highestQualification);

      case 2:
      case 3:
      case 4:
      case 5:
        // We've been instructed that all other steps/fields are fully optional to improve UX
        return true;

      default:
        return false;
    }
  };

  const handleStepChange = (newStep: number) => {
    setSubmitMessage('');
    setCurrentStep(newStep);
  };

  const nextStep = () =>
    validateStep(currentStep)
      ? handleStepChange(currentStep + 1)
      : setSubmitMessage('Please complete all required fields.');
  const prevStep = () => handleStepChange(Math.max(0, currentStep - 1));

  const handleSubmit = async () => {

    for (let i = 0; i <= 5; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        setSubmitMessage(`Please complete all required fields in Step ${i + 1} before submitting.`);
        return;
      }
    }

    setSubmitMessage('Saving your details...');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/users/studentDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save details.');
      }

      setSubmitMessage('Details saved successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/my-profile');
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setSubmitMessage(`Error: ${message}`);
    }
  };

  // ── Real profile-strength: count every filled field ─────────────
  const completion = useMemo(() => {
    const isValueFilled = (v: unknown): boolean => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      if (typeof v === 'boolean') return true; // false is still an answer
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object') return Object.values(v).some(isValueFilled);
      return Boolean(v);
    };

    let filled = 0;
    let total = 0;

    // Basic (10 fields)
    Object.values(formData.basic).forEach((v) => { total++; if (isValueFilled(v)) filled++; });
    // Academic (count only the fields visible for chosen qualification)
    const academicFields = visibleAcademicFields.length > 0
      ? visibleAcademicFields
      : Object.keys(formData.academic);
    academicFields.forEach((f) => {
      total++;
      const v = (formData.academic as Record<string, unknown>)[f];
      if (isValueFilled(v)) filled++;
    });
    // Certifications (counts as 1 slot)
    total++; if (formData.certifications.length > 0) filled++;
    // Experience (3 fields)
    Object.values(formData.experience).forEach((v) => { total++; if (isValueFilled(v)) filled++; });
    // Physical (4 fields)
    Object.values(formData.physical).forEach((v) => { total++; if (isValueFilled(v)) filled++; });
    // Other (1 field)
    if (formData.other.isExServiceman !== null) filled++; total++;

    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [formData, visibleAcademicFields]);

  if (profileLoading) {
    return <Loader text="Syncing Profile" />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 sm:px-6 sm:py-5 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-300">
            Candidate Dashboard
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Student Detail Form
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm sm:leading-7">
                Eligibility matching unlocks once the
                required profile fields are complete.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-cyan-400/10 bg-cyan-400/10 px-4 py-3 sm:min-w-[220px] sm:flex-col sm:items-start sm:py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                Profile completion
              </p>
              <p className="text-xl font-bold text-white sm:mt-2 sm:text-3xl">{completion}%</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar - Desktop Only */}
          <aside className={`${cardClasses} p-5 hidden xl:block self-start sticky top-8`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                  Step navigator
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Multi-step profile
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                {currentStep + 1}/{stepTitles.length}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {stepTitles.map((step, index) => {
                const isCurrent = index === currentStep;
                const isDone = validateStep(index) && index !== currentStep;

                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => handleStepChange(index)}
                    className={[
                      'w-full text-left rounded-2xl border px-4 py-4 transition-all hover:scale-[1.02] cursor-pointer active:scale-95',
                      isCurrent
                        ? 'border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : isDone
                          ? 'border-emerald-400/20 bg-emerald-400/10 hover:border-emerald-400/40 hover:bg-emerald-400/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition-colors',
                          isCurrent
                            ? 'bg-cyan-400 text-slate-950'
                            : isDone
                              ? 'bg-emerald-400/80 text-slate-950'
                              : 'bg-slate-800 text-slate-300',
                        ].join(' ')}
                      >
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {step.eyebrow}
                        </p>
                        <p className="mt-1 font-medium text-white">{step.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{step.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {!eligibilityReadiness.isReady ? (
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Eligibility Readiness
                </p>
                <p className="mt-2 text-lg font-semibold text-white">More details needed</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {eligibilityReadiness.missingFields.length} required items are still missing.
                </p>
              </div>
            ) : null}
          </aside>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Mobile Progress Header */}
            <div className="flex flex-col gap-3 xl:hidden">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                 <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                       {React.createElement(stepTitles[currentStep].icon, { className: "h-5 w-5" })}
                    </div>
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">{stepTitles[currentStep].eyebrow}</p>
                       <p className="text-sm font-bold text-white">{stepTitles[currentStep].title}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Step</p>
                    <p className="text-sm font-bold text-white">{currentStep + 1} <span className="text-slate-500">/ {stepTitles.length}</span></p>
                 </div>
              </div>
              
              {/* Mini Step Dots */}
              <div className="flex gap-1.5 px-1">
                {stepTitles.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-cyan-400' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>

            <div className={`${cardClasses} p-5 sm:p-8`}>
            <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 hidden sm:flex sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                  {stepTitles[currentStep].eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {stepTitles[currentStep].title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {stepTitles[currentStep].subtitle}
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full Name" htmlFor="fullName">
                      <input id="fullName" name="fullName" title="Full Name" className={inputClasses} value={formData.basic.fullName} onChange={(e) => updateField('basic', 'fullName', e.target.value)} placeholder="e.g. John Doe" />
                    </Field>
                    <Field label="Date of Birth" htmlFor="dob">
                      <input id="dob" name="dob" type="date" title="Date of Birth" className={inputClasses} value={formData.basic.dob} onChange={(e) => updateField('basic', 'dob', e.target.value)} />
                    </Field>
                    <Field label="Gender" htmlFor="gender">
                      <CustomDropdown
                        options={[{ value: '', label: 'Select Gender' }, ...GENDERS.map(g => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1).replace(/_/g, ' ') }))]}
                        value={formData.basic.gender}
                        onChange={(val) => updateField('basic', 'gender', val)}
                      />
                    </Field>
                    <Field label="Category" htmlFor="category">
                      <CustomDropdown
                        options={[{ value: '', label: 'Select Category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                        value={formData.basic.category}
                        onChange={(val) => updateField('basic', 'category', val)}
                      />
                    </Field>
                    <Field label="Domicile State" htmlFor="domicile">
                      <CustomDropdown
                        options={[{ value: '', label: 'Select State' }, ...DOMICILE_STATES.map(s => ({ value: s, label: s }))]}
                        value={formData.basic.domicile}
                        onChange={(val) => updateField('basic', 'domicile', val)}
                      />
                    </Field>
                    <Field label="PwD Status (Disabled?)" htmlFor="isPwD">
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select' },
                          { value: 'true', label: 'Yes' },
                          { value: 'false', label: 'No' }
                        ]}
                        value={formData.basic.isPwD}
                        onChange={(val) => updateField('basic', 'isPwD', val)}
                      />
                    </Field>
                    <Field label="Phone *" htmlFor="phone">
                      <input id="phone" title="Phone Number" type="tel" className={inputClasses} value={formData.basic.phone} onChange={(e) => updateField('basic', 'phone', e.target.value)} placeholder="Valid phone number" />
                    </Field>
                    <Field label="PIN Code" htmlFor="pinCode" helper={lookupState.loading ? 'Fetching state details...' : lookupState.error}>
                      <input id="pinCode" title="PIN Code" maxLength={6} className={inputClasses} value={formData.basic.pinCode} onChange={(e) => updateField('basic', 'pinCode', e.target.value)} placeholder="6-digit PIN" />
                    </Field>
                    <Field label="District" htmlFor="district">
                      <input id="district" className={inputClasses} value={formData.basic.district} onChange={(e) => updateField('basic', 'district', e.target.value)} />
                    </Field>
                    <Field label="Nationality" htmlFor="nationality">
                      <input id="nationality" title="Nationality" className={inputClasses} value={formData.basic.nationality} onChange={(e) => updateField('basic', 'nationality', e.target.value)} />
                    </Field>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Highest Qualification" htmlFor="highestQualification" span={2}>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'Select Qualification' },
                          ...QUALIFICATION_LEVELS.map(q => ({ value: q, label: q.charAt(0).toUpperCase() + q.slice(1).replace(/_/g, ' ') }))
                        ]}
                        value={formData.academic.highestQualification}
                        onChange={(val) => updateField('academic', 'highestQualification', val)}
                      />
                    </Field>

                    {visibleAcademicFields.includes('tenthPercentage') && (
                      <>
                        <Field label="10th Board" htmlFor="tenthBoard" span={2}>
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Board' }, ...SCHOOL_BOARDS.map(b => ({ value: b, label: b }))]}
                            value={formData.academic.tenthBoard}
                            onChange={(val) => updateField('academic', 'tenthBoard', val)}
                          />
                          {shouldShowCustomInput(formData.academic.tenthBoard, boardOptions, 'tenthBoard') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.tenthBoard} onChange={(e) => updateField('academic', 'tenthBoard', e.target.value)} placeholder="Enter board name" />
                          ) : null}
                        </Field>
                        <Field label="10th Percentage" htmlFor="tenthPercentage"><input id="tenthPercentage" name="tenthPercentage" title="10th Percentage" className={inputClasses} value={formData.academic.tenthPercentage} onChange={(e) => updateField('academic', 'tenthPercentage', e.target.value)} placeholder="e.g. 85.5" /></Field>
                        <Field label="10th Passing Year" htmlFor="tenthPassingYear"><input id="tenthPassingYear" name="tenthPassingYear" title="10th Passing Year" type="number" className={inputClasses} value={formData.academic.tenthPassingYear} onChange={(e) => updateField('academic', 'tenthPassingYear', e.target.value)} placeholder="YYYY" /></Field>
                      </>
                    )}

                    {visibleAcademicFields.includes('twelfthBoard') && (
                      <>
                        <Field label="12th Board" htmlFor="twelfthBoard">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Board' }, ...boardOptions.map(b => ({ value: b, label: b })), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.twelfthBoard, boardOptions, 'twelfthBoard')}
                            onChange={(val) => handleAcademicSelectWithOther('twelfthBoard', val)}
                          />
                          {shouldShowCustomInput(formData.academic.twelfthBoard, boardOptions, 'twelfthBoard') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.twelfthBoard} onChange={(e) => updateField('academic', 'twelfthBoard', e.target.value)} placeholder="Enter board name" />
                          ) : null}
                        </Field>
                        <Field label="12th Stream" htmlFor="twelfthStream">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Stream' }, ...coursesData.intermediate['12th Standard'].map((s: string) => ({ value: s, label: s })), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.twelfthStream, coursesData.intermediate['12th Standard'], 'twelfthStream')}
                            onChange={(val) => handleAcademicSelectWithOther('twelfthStream', val)}
                          />
                          {shouldShowCustomInput(formData.academic.twelfthStream, coursesData.intermediate['12th Standard'], 'twelfthStream') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.twelfthStream} onChange={(e) => updateField('academic', 'twelfthStream', e.target.value)} placeholder="Enter stream name" />
                          ) : null}
                        </Field>
                        <Field label="12th Subjects" span={2}>
                          <div className="flex flex-wrap gap-3">
                            {twelfthSubjectsOptions.map((sub: string) => {
                              const isActive = formData.academic.twelfthSubjects.includes(sub);
                              return (
                                <button key={sub} type="button" onClick={() => toggleSubject(sub)} className={['rounded-full border px-4 py-2 text-sm font-medium transition', isActive ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10'].join(' ')}>
                                  {isActive ? '✓ ' : '+ '}{sub}
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                        <Field label="12th Percentage" htmlFor="twelfthPercentage"><input id="twelfthPercentage" name="twelfthPercentage" title="12th Percentage" className={inputClasses} value={formData.academic.twelfthPercentage} onChange={(e) => updateField('academic', 'twelfthPercentage', e.target.value)} placeholder="e.g. 80.0" /></Field>
                        <Field label="12th Passing Year" htmlFor="twelfthPassingYear"><input id="twelfthPassingYear" name="twelfthPassingYear" title="12th Passing Year" type="number" className={inputClasses} value={formData.academic.twelfthPassingYear} onChange={(e) => updateField('academic', 'twelfthPassingYear', e.target.value)} placeholder="YYYY" /></Field>
                      </>
                    )}

                    {qualification === 'diploma' && (
                      <Field label="Diploma Percentage" htmlFor="diplomaPercentage"><input id="diplomaPercentage" name="diplomaPercentage" title="Diploma Percentage" className={inputClasses} value={formData.academic.diplomaPercentage} onChange={(e) => updateField('academic', 'diplomaPercentage', e.target.value)} /></Field>
                    )}

                    {visibleAcademicFields.includes('programme') && (
                      <>
                        <h3 className="col-span-1 md:col-span-2 mt-4 text-sm font-bold text-cyan-300 border-b border-white/5 pb-2">
                          {qualification === 'postgraduate' ? 'Postgraduate Degree Details' : 'Degree Details'}
                        </h3>
                        <Field label="Programme" htmlFor="programme">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Programme' }, ...Object.keys(qualification ? (coursesData[qualification] || {}) : {}).map(p => ({ value: p, label: p })), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.programme, qualification ? Object.keys(coursesData[qualification] || {}) : [], 'programme')}
                            onChange={(val) => handleAcademicSelectWithOther('programme', val)}
                          />
                          {shouldShowCustomInput(formData.academic.programme, qualification ? Object.keys(coursesData[qualification] || {}) : [], 'programme') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.programme} onChange={(e) => updateField('academic', 'programme', e.target.value)} placeholder="Enter programme name" />
                          ) : null}
                        </Field>
                        <Field label="Branch/Specialization" htmlFor="branch">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Branch' }, ...(qualification && formData.academic.programme && coursesData[qualification]?.[formData.academic.programme] ? coursesData[qualification][formData.academic.programme].map((b: string) => ({ value: b, label: b })) : []), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.branch, qualification && formData.academic.programme && coursesData[qualification]?.[formData.academic.programme] ? coursesData[qualification][formData.academic.programme] : [], 'branch')}
                            onChange={(val) => handleAcademicSelectWithOther('branch', val)}
                          />
                          {shouldShowCustomInput(formData.academic.branch, qualification && formData.academic.programme && coursesData[qualification]?.[formData.academic.programme] ? coursesData[qualification][formData.academic.programme] : [], 'branch') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.branch} onChange={(e) => updateField('academic', 'branch', e.target.value)} placeholder="Enter branch name" />
                          ) : null}
                        </Field>
                        <Field label="College / Institution Name" htmlFor="college" span={2}><input id="college" name="college" title="College or Institution Name" className={inputClasses} value={formData.academic.college} onChange={(e) => updateField('academic', 'college', e.target.value)} /></Field>
                      </>
                    )}

                    {visibleAcademicFields.includes('graduationStatus') && (
                      <Field label="Graduation Status" htmlFor="graduationStatus">
                        <CustomDropdown
                          options={[{ value: '', label: 'Select Status' }, ...GRADUATION_STATUSES.map(s => ({ value: s, label: s }))]}
                          value={formData.academic.graduationStatus}
                          onChange={(val) => updateField('academic', 'graduationStatus', val)}
                        />
                      </Field>
                    )}

                    {visibleAcademicFields.includes('gpa') && (
                      <Field label="GPA / Aggregate %" htmlFor="gpa"><input id="gpa" name="gpa" title="GPA or Aggregate Percentage" className={inputClasses} value={formData.academic.gpa} onChange={(e) => updateField('academic', 'gpa', e.target.value)} placeholder="Overall Score" /></Field>
                    )}

                    {qualification === 'postgraduate' && visibleAcademicFields.includes('ugProgramme') && (
                      <>
                        <h3 className="col-span-1 md:col-span-2 mt-6 text-sm font-bold text-emerald-300 border-b border-white/5 pb-2">
                          Undergraduate Degree Details
                        </h3>
                        <Field label="UG Programme" htmlFor="ugProgramme">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select UG Programme' }, ...Object.keys(coursesData.undergraduate || {}).map(p => ({ value: p, label: p })), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.ugProgramme, coursesData.undergraduate ? Object.keys(coursesData.undergraduate) : [], 'ugProgramme')}
                            onChange={(val) => handleAcademicSelectWithOther('ugProgramme', val)}
                          />
                          {shouldShowCustomInput(formData.academic.ugProgramme, coursesData.undergraduate ? Object.keys(coursesData.undergraduate) : [], 'ugProgramme') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.ugProgramme} onChange={(e) => updateField('academic', 'ugProgramme', e.target.value)} placeholder="Enter UG programme" />
                          ) : null}
                        </Field>
                        <Field label="UG Branch" htmlFor="ugBranch">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select UG Branch' }, ...(formData.academic.ugProgramme && coursesData.undergraduate?.[formData.academic.ugProgramme] ? coursesData.undergraduate[formData.academic.ugProgramme].map((b: string) => ({ value: b, label: b })) : []), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.academic.ugBranch, formData.academic.ugProgramme && coursesData.undergraduate?.[formData.academic.ugProgramme] ? coursesData.undergraduate[formData.academic.ugProgramme] : [], 'ugBranch')}
                            onChange={(val) => handleAcademicSelectWithOther('ugBranch', val)}
                          />
                          {shouldShowCustomInput(formData.academic.ugBranch, formData.academic.ugProgramme && coursesData.undergraduate?.[formData.academic.ugProgramme] ? coursesData.undergraduate[formData.academic.ugProgramme] : [], 'ugBranch') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.academic.ugBranch} onChange={(e) => updateField('academic', 'ugBranch', e.target.value)} placeholder="Enter UG branch" />
                          ) : null}
                        </Field>
                        <Field label="UG College Name" htmlFor="ugCollege" span={2}>
                          <input id="ugCollege" name="ugCollege" title="UG College Name" className={inputClasses} value={formData.academic.ugCollege} onChange={(e) => updateField('academic', 'ugCollege', e.target.value)} />
                        </Field>
                        <Field label="UG Passing Year" htmlFor="ugPassingYear">
                          <input id="ugPassingYear" name="ugPassingYear" type="number" title="UG Passing Year" className={inputClasses} value={formData.academic.ugPassingYear} onChange={(e) => updateField('academic', 'ugPassingYear', e.target.value)} placeholder="YYYY" />
                        </Field>
                        <Field label="UG Percentage/GPA" htmlFor="ugPercentage">
                          <input id="ugPercentage" name="ugPercentage" title="UG Percentage GPA" className={inputClasses} value={formData.academic.ugPercentage} onChange={(e) => updateField('academic', 'ugPercentage', e.target.value)} placeholder="e.g. 75.5" />
                        </Field>
                      </>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {certificationOptions.map((cert) => {
                      const active = formData.certifications.includes(cert);
                      return (
                        <button key={cert} type="button" onClick={() => toggleCert(cert)} className={['flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer', active ? 'border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.05)]' : 'border-white/10 bg-slate-950/50 hover:border-cyan-400/20 hover:bg-white/5'].join(' ')}>
                          <span className={['flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-colors', active ? 'border-cyan-300 bg-cyan-400 text-slate-950' : 'border-slate-600 bg-slate-800 text-slate-400'].join(' ')}>{active ? '✓' : ''}</span>
                          <span className={['transition-colors', active ? 'font-medium text-cyan-100' : 'text-slate-300'].join(' ')}>{cert}</span>
                        </button>
                      );
                    })}
                    {formData.certifications.length === 0 && <div className="md:col-span-2 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-4 text-sm italic text-slate-400">Optional: Select any specialized certifications or licenses you possess.</div>}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Work Experience?" htmlFor="hasExperience" span={2}>
                      <CustomDropdown
                        options={[{ value: '', label: 'Select' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                        value={formData.experience.hasExperience}
                        onChange={(val) => handleInputChange('experience', 'hasExperience', val)}
                      />
                    </Field>
                    {formData.experience.hasExperience === 'true' && (
                      <>
                        <Field label="Years" htmlFor="years"><input id="years" name="years" title="Years of Experience" type="number" className={inputClasses} value={formData.experience.years} onChange={(e) => handleInputChange('experience', 'years', e.target.value)} /></Field>
                        <Field label="Field" htmlFor="experienceField">
                          <CustomDropdown
                            options={[{ value: '', label: 'Select Field' }, ...experienceFields.map(f => ({ value: f, label: f })), { value: OTHER_OPTION, label: 'Other' }]}
                            value={getSelectValue(formData.experience.field, experienceFields, 'experienceField')}
                            onChange={(val) => {
                              if (val === OTHER_OPTION) {
                                setCustomSelection('experienceField', true);
                                handleInputChange('experience', 'field', '');
                                return;
                              }
                              setCustomSelection('experienceField', false);
                              handleInputChange('experience', 'field', val);
                            }}
                          />
                          {shouldShowCustomInput(formData.experience.field, experienceFields, 'experienceField') ? (
                            <input className={`${inputClasses} mt-3`} value={formData.experience.field} onChange={(e) => handleInputChange('experience', 'field', e.target.value)} placeholder="Enter experience field" />
                          ) : null}
                        </Field>
                      </>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Height (cm)" htmlFor="height"><input id="height" name="height" title="Height in centimeters" className={inputClasses} value={formData.physical.height} onChange={(e) => handleInputChange('physical', 'height', e.target.value)} /></Field>
                    <Field label="Weight (kg)" htmlFor="weight"><input id="weight" name="weight" title="Weight in kilograms" className={inputClasses} value={formData.physical.weight} onChange={(e) => handleInputChange('physical', 'weight', e.target.value)} /></Field>
                    <Field label="Chest (cm)" htmlFor="chest"><input id="chest" name="chest" title="Chest in centimeters" className={inputClasses} value={formData.physical.chest} onChange={(e) => handleInputChange('physical', 'chest', e.target.value)} /></Field>
                    <Field label="Physical Fit?" htmlFor="isPhysicalFit">
                      <CustomDropdown
                        options={[{ value: '', label: 'Select' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                        value={formData.physical.isPhysicalFit}
                        onChange={(val) => handleInputChange('physical', 'isPhysicalFit', val)}
                      />
                    </Field>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Ex-Serviceman?" htmlFor="isExServiceman" span={2}>
                      <select id="isExServiceman" name="isExServiceman" title="Ex Serviceman" className={inputClasses} value={formData.other.isExServiceman ?? ''} onChange={(e) => handleInputChange('other', 'isExServiceman', e.target.value === 'true')}>
                        <option value="">Select</option><option value="false">No</option><option value="true">Yes</option>
                      </select>
                    </Field>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {submitMessage && <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{submitMessage}</div>}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-white/10 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer" onClick={prevStep} disabled={currentStep === 0}>Back</button>
              {currentStep < 5 ? (
                <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 cursor-pointer" onClick={nextStep}>Next</button>
              ) : (
                <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 cursor-pointer" onClick={handleSubmit}>Submit All Details</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailFormDashboard;
