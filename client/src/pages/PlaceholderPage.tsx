import React from 'react';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
  <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
      Government Exam Eligibility Platform
    </p>
    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{title}</h1>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm text-slate-400">Primary module</p>
        <p className="mt-2 text-lg font-semibold text-white">{title}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm text-slate-400">Status</p>
        <p className="mt-2 text-lg font-semibold text-white">Frontend scaffold ready</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm text-slate-400">Integration note</p>
        <p className="mt-2 text-lg font-semibold text-white">Hook this page to your existing APIs</p>
      </div>
    </div>
  </div>
);

export default PlaceholderPage;
