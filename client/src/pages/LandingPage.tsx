import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BellRing, Target, ArrowRight, FileCheck, CheckCircle2, LayoutDashboard } from 'lucide-react';

const LandingPage: React.FC = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[30%] rounded-[100%] bg-indigo-600/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-5 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <ShieldCheck className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                Government Exam Platform
              </p>
                <p className="text-xl font-bold tracking-tight text-white">
                  EligibilityHub
                </p>
              </div>
            </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.header>

        <main className="flex-1 mt-10 lg:mt-20">
          {/* Hero Section */}
          <section className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  v2.0 Beta Now Live
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="mt-8 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[4.5rem] leading-[1.1]">
                Check Your Government Exam Eligibility Faster. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300">
                  Track Alerts. Apply Smarter.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="mt-6 text-lg leading-relaxed text-slate-400">
                Build your verified profile once, check which government exams you qualify for, and stay ahead of application deadlines with timely alerts from Eligify.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-950 transition-all hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Create Free Profile
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="#"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  See How It Works
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  ['250+', 'Exams Tracked'],
                  ['100%', 'Accuracy'],
                  ['Zero', 'Missed Deadlines'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative perspective-1000"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse" />
              <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/50 p-2 backdrop-blur-xl shadow-2xl">
                <img 
                  src="/images/hero-abstract.png" 
                  alt="Eligify dashboard preview showing government exam eligibility insights"
                  width="1024"
                  height="1024"
                  className="rounded-[1.5rem] w-full h-auto object-cover border border-white/5"
                />
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-6 top-1/4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-xl shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Eligible Match!</p>
                      <p className="text-xs text-emerald-200">UPSC Prelims 2026</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Features Bento Grid */}
          <section className="py-24">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex flex-col items-center text-center mb-16 w-full">
                <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center w-full">
                  Everything you need to <span className="text-cyan-400">secure your future</span>
                </h3>
                <p className="mt-4 text-slate-400 max-w-2xl text-center w-full">
                  We've completely re-engineered how candidates track and apply for government exams. No more spreadsheets, missed deadlines, or disqualified applications.
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 h-auto md:h-[600px]">
                
                {/* Bento Box 1: Large Feature */}
                <motion.div variants={fadeInUp} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md md:col-span-2 md:row-span-1 transition-all hover:bg-slate-900/60 hover:border-cyan-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col h-full justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                      <Target className="h-6 w-6" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">Hyper-Targeted Eligibility Engine</h4>
                    <p className="text-slate-400 leading-relaxed max-w-md">
                      Our intelligent algorithm matches your personal, academic, category, and domicile data against thousands of state and central rules instantly.
                    </p>
                  </div>
                </motion.div>

                {/* Bento Box 2: Image Focus */}
                <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-md md:col-span-1 md:row-span-2 flex flex-col items-center justify-center text-center p-8">
                  <div className="absolute inset-0 bg-emerald-500/5" />
                  <img 
                    src="/images/shield-icon.png" 
                    alt="Illustration representing secure candidate profile storage"
                    loading="lazy"
                    width="1024"
                    height="1024"
                    className="w-48 h-48 object-contain mb-8 z-10 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  />
                  <div className="relative z-10">
                    <h4 className="text-2xl font-bold text-white mb-3">Verified Profile Security</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Your data is encrypted and secure. Build your profile once and use it as a master key for all future applications and document verifications.
                    </p>
                  </div>
                </motion.div>

                {/* Bento Box 3: Small Feature */}
                <motion.div variants={fadeInUp} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md md:col-span-1 transition-all hover:bg-slate-900/60 hover:border-purple-500/30">
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                      <BellRing className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">Proactive Alerts</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Real-time push notifications for opening dates, closing deadlines, and admit card releases.
                    </p>
                </motion.div>

                {/* Bento Box 4: Small Feature */}
                <motion.div variants={fadeInUp} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md md:col-span-1 transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">Smart Document Wallet</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Store certificates and marksheets in one place, perfectly resized for official portals.
                    </p>
                </motion.div>

              </div>
            </motion.div>
          </section>

          {/* How It Works */}
          <section className="py-24 border-t border-white/5">
             <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center"
            >
              <motion.h3 variants={fadeInUp} className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-16">
                Your journey to success in three steps
              </motion.h3>

              <div className="grid gap-8 lg:grid-cols-3 relative pt-4">
                {/* Connecting Line (Desktop only) */}
                <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -z-10" />

                {[
                  { step: '01', title: 'Create Master Profile', desc: 'Input your academic, personal, and category details into our secure vault.', icon: LayoutDashboard },
                  { step: '02', title: 'Engine Discovers Matches', desc: 'Our algorithm instantly scans 250+ active exams to find your perfect matches.', icon: Zap },
                  { step: '03', title: 'Apply & Track', desc: 'Receive deadline alerts, prep strategy tools, and admit card tracking automatically.', icon: Target },
                ].map((item, index) => (
                  <motion.div key={item.step} variants={fadeInUp} className="relative group flex flex-col items-center text-center w-full">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 shadow-xl relative z-10 group-hover:border-cyan-400/50 transition-colors">
                       <item.icon className="h-7 w-7 text-cyan-400" />
                       <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                         {item.step}
                       </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3 text-center w-full">{item.title}</h4>
                    <p className="text-slate-400 leading-relaxed max-w-xs mx-auto text-center w-full">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="py-24 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex flex-col items-center overflow-hidden rounded-[3rem] border border-cyan-500/20 bg-gradient-to-b from-cyan-900/20 to-slate-900/80 px-8 py-20 text-center backdrop-blur-md sm:px-16"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <h3 className="relative z-10 text-4xl font-extrabold tracking-tight text-white sm:text-5xl text-center w-full">
                Ready to stop missing out?
              </h3>
              <p className="relative z-10 mt-6 max-w-xl text-lg text-slate-300 text-center w-full">
                Join thousands of candidates who have streamlined their government exam journey. Your next big opportunity is waiting.
              </p>
              <div className="relative z-10 mt-10 flex w-full justify-center">
                <Link
                  to="/signup"
                  className="rounded-2xl bg-cyan-400 px-10 py-5 text-lg font-bold text-slate-950 transition-all hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] inline-block"
                >
                  Start Your Free Trial
                </Link>
              </div>
            </motion.div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default LandingPage;
