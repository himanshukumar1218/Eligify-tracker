import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] text-slate-100">
      <div className="flex h-full">
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        <div className="flex flex-1 min-w-0 flex-col h-full">
          <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8 lg:py-8">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-3 shadow-[0_30px_120px_rgba(15,23,42,0.8)] backdrop-blur-sm sm:p-6">
                <Outlet />
              </div>
              
              <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 pb-4 text-[10px] font-medium text-slate-500 sm:flex-row">
                <p>© {new Date().getFullYear()} Eligify Platform. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Support</a>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
