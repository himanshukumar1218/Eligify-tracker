import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut,
  Menu
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userDetails, setUserDetails] = useState({
    initials: 'AB',
    name: 'Aspirant User',
    email: 'aspirant@eligify.com'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payloadStart = token.indexOf('.') + 1;
      const payloadEnd = token.indexOf('.', payloadStart);
      if (payloadStart === 0 || payloadEnd === -1) return;
      
      const payloadStr = atob(token.slice(payloadStart, payloadEnd));
      const payload = JSON.parse(payloadStr);
      
      const email = payload.email || 'aspirant@eligify.com';
      const name = payload.fullName || payload.username || payload.name || 'Aspirant User';
      
      let initials = 'AB';
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        initials = parts[0].slice(0, 2).toUpperCase();
      } else if (email && email !== 'aspirant@eligify.com') {
        initials = email.slice(0, 2).toUpperCase();
      }

      setUserDetails({ initials, name, email });
    } catch (e) {
      console.error("Failed to parse token for user details", e);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B1120]/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 h-20">
        
        {/* Left Side - Branding */}
        <div className="flex-shrink-0 flex items-center min-w-[200px] gap-3">
          {/* Mobile Hamburger Toggle */}
          <button 
            type="button" 
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-0.5">
              Dashboard Overview
            </p>
            <h2 className="truncate text-xl font-bold tracking-tight text-white">
              Eligify
            </h2>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-2xl px-8 items-center justify-center">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search exams, posts, documents..."
              className="w-full h-10 pl-10 pr-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-slate-900 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right Side - Actions & Profile */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          

          <NotificationDropdown />

          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              aria-label="User profile menu"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 rounded-xl border border-slate-800/60 p-1.5 pr-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer hover:scale-105 active:scale-95 ${isDropdownOpen ? 'bg-slate-800/80 border-cyan-500/30' : 'bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700'}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-sm">
                {userDetails.initials}
              </div>
              <div className="hidden md:flex flex-col items-start px-1">
                <span className="text-[13px] font-semibold text-white leading-none mb-1">{userDetails.name}</span>
                <span className="text-[10px] text-cyan-400/80 leading-none">Profile synced</span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-800/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-800/60 mb-1">
                  <p className="text-sm font-semibold text-white">{userDetails.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{userDetails.email}</p>
                </div>
                
                <div className="px-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200 hover:pl-4 cursor-pointer">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Help / Support
                  </button>
                </div>

                <div className="mt-1 pt-1 border-t border-slate-800/60 px-1.5">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:pl-4 group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default Header;
