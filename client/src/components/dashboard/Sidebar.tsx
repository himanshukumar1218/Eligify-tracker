import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  UserCircle, 
  Files, 
  BookMarked,
  BellRing, 
  ShieldCheck,
  X
} from 'lucide-react';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Eligible Exams', path: '/eligible-exams', icon: ClipboardCheck },
  { label: 'My Profile', path: '/my-profile', icon: UserCircle },
  { label: 'Documents', path: '/documents', icon: Files },
  { label: 'Prep Tracker', path: '/prep-tracker', icon: BookMarked },
  { label: 'Notifications', path: '/notifications', icon: BellRing, section: 'Settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-screen shrink-0 border-r border-slate-800/80 bg-[#0B1120] px-4 py-6 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-5 p-2 lg:hidden text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      {/* Branding */}
      <div className="flex items-center gap-3 px-3 mb-8 cursor-pointer group">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 transform group-hover:-translate-y-0.5">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-0.5">
            Dashboard
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Eligify
          </h1>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.path}>
                {index === 0 && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 px-3 mb-2 mt-2">
                    Application
                  </p>
                )}
                {item.section && (
                  <>
                    <div className="px-3 my-4">
                      <hr className="border-slate-800/80" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500/80 px-3 mb-2">
                      {item.section}
                    </p>
                  </>
                )}
                <NavLink
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ease-in-out font-medium text-sm',
                      isActive
                        ? 'bg-cyan-500/10 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 rounded-r-lg bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                      )}
                      
                      <Icon 
                        className={[
                          'w-5 h-5 shrink-0 transition-all duration-200',
                          isActive 
                            ? 'text-cyan-400' 
                            : 'text-slate-500 group-hover:text-cyan-400/70 group-hover:scale-110'
                        ].join(' ')} 
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

    </aside>
    </>
  );
};

export default Sidebar;
