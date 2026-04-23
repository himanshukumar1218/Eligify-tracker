import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  X, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export interface EligibilityReason {
  code: string;
  category: string;
  field: string;
  severity: 'hard' | 'soft';
  message: string;
  actionText: string;
  details?: Record<string, unknown> | null;
}

export interface ExamData {
  examName: string;
  postName: string;
  organisation: string;
  reasons: EligibilityReason[];
}

interface EligibilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamData | null;
}

const EligibilityDrawer: React.FC<EligibilityDrawerProps> = ({ isOpen, onClose, exam }) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!exam && !isOpen) return null;

  const categoryLabels: Record<string, string> = {
    age: 'Age Bracket',
    education: 'Academic Criteria',
    experience: 'Work Experience',
    certification: 'Specialized Certification',
    physical: 'Physical Standards',
    domicile: 'Domicile',
    gender: 'Gender',
    profile: 'Profile Status',
    post: 'Post Status',
  };

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={isOpen ? onClose : undefined}
      />

      {/* Drawer Wrapper (prevents horizontal scroll widening) */}
      <div className={`fixed inset-0 z-[70] pointer-events-none overflow-hidden ${!isOpen && !exam ? 'hidden' : ''}`}>
        {/* Drawer */}
        <div 
          className={`absolute inset-y-0 right-0 pointer-events-auto w-full sm:w-[448px] bg-slate-900 border-l border-white/10 shadow-[-20px_0_100px_rgba(2,6,23,0.9)] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">
                <AlertCircle className="h-3 w-3" />
                Near Match
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{exam?.postName || 'Post Name'}</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">{exam?.examName || 'Exam Name'}</p>
              <p className="text-xs text-slate-500 mt-1">{exam?.organisation}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          <div className="mb-8 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 p-4 flex items-start gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-100">Almost Eligible</h3>
              <p className="text-xs text-cyan-200/70 mt-1 leading-relaxed">
                You meet most requirements for this post, but you have <strong>{exam?.reasons?.length || 0} items</strong> that need review before you can apply.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Eligibility Roadblocks</h3>
            
            {exam?.reasons && exam.reasons.length > 0 ? (
              exam.reasons.map((reason, index) => {
                const isRed = reason.severity === 'hard';

                return (
                  <div 
                    key={index} 
                    className={`relative overflow-hidden rounded-2xl border ${isRed ? 'border-rose-500/20 bg-rose-500/5' : 'border-amber-500/20 bg-amber-500/5'} p-5 transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {isRed ? (
                           <XCircle className="h-5 w-5 text-rose-400" />
                        ) : (
                           <AlertCircle className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-normal ${isRed ? 'text-rose-100' : 'text-amber-100'}`}>
                          {reason.message}
                        </p>
                        
                        {/* Structure Match UI */}
                        <div className="mt-4 grid grid-cols-2 gap-3 pb-4 border-b border-white/5">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Criteria Area</p>
                            <p className="text-xs font-medium text-slate-300 mt-1">{categoryLabels[reason.category] || 'Standard Criteria'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Your Profile</p>
                            <p className="text-xs font-medium text-slate-500 mt-1 italic">Not satisfied</p>
                          </div>
                        </div>

                        {/* Action Fix Text */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isRed ? 'text-rose-400/80' : 'text-amber-400/80'}`}>
                            How to fix: {reason.actionText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-emerald-100">Profile matches perfectly!</h3>
                   <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                     There are no missing criteria on your profile! This post is flagged as a Near Match because the application deadline has likely passed or the status is inactive.
                   </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 p-6 border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
          <Link 
            to="/student-details"
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          >
            Update My Profile
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-center text-[11px] text-slate-500 mt-3 font-medium">Navigates to your settings to upload details</p>
        </div>
      </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
};

export default EligibilityDrawer;
