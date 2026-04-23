import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/dashboard/Header';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] text-slate-100">
      <div className="flex min-h-screen flex-col">
        {/* We reuse the generic Header but we don't pass onOpenSidebar since there is no sidebar */}
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="rounded-[28px] border border-fuchsia-500/20 bg-slate-950/40 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.8)] backdrop-blur-sm sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
