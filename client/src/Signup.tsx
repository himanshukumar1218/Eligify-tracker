import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { API_BASE } from './utils/api';

interface SignupProps {
  signupEndpoint?: string;
  onOpenLogin?: () => void;
  onSuccess?: () => void;
}

const Signup: React.FC<SignupProps> = ({ signupEndpoint, onOpenLogin, onSuccess }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const navigate = useNavigate();
  
  const endpoint = signupEndpoint || `${API_BASE}/api/users/signup`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      localStorage.setItem('token', data.token);
      setStatus({ loading: false, error: '', success: 'Account created successfully!' });
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else navigate('/student-details');
      }, 1500);
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setStatus({ loading: true, error: '', success: '' });
    try {
      const res = await fetch(`${API_BASE}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');

      localStorage.setItem('token', data.token);
      setStatus({ loading: false, error: '', success: 'Welcome to Eligify!' });
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] flex items-center justify-center p-4 selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
        
        {/* Branding & Value Prop Section */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block space-y-10"
        >
          <div className="flex items-center gap-4 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-all duration-500">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-white">Eligify</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-white xl:text-7xl">
              Start Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">Journey Now.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg font-medium">
              Join the elite circle of students leveraging our intelligence engine to secure their futures.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { text: "Predictive Eligibility Engine", color: "bg-cyan-400" },
              { text: "Dynamic Exam Roadmaps", color: "bg-blue-400" },
              { text: "Smart Deadline Guardian", color: "bg-indigo-400" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-4 text-slate-200"
              >
                <div className={`h-2 w-2 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
                <span className="text-base font-semibold tracking-wide">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Signup Card Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-[480px]"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl sm:p-12">
            
            <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-white tracking-tight">Create Account</h2>
              <p className="mt-3 text-slate-400 font-medium">Enter your details to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Preferred Username"
                    className="w-full rounded-2xl border border-white/5 bg-slate-950/40 py-4.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-950/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Your Email Address"
                    className="w-full rounded-2xl border border-white/5 bg-slate-950/40 py-4.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-950/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Secure Password"
                    className="w-full rounded-2xl border border-white/5 bg-slate-950/40 py-4.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-950/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {status.error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-bold text-rose-400 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 text-center">
                      {status.error}
                    </p>
                  </motion.div>
                )}
                {status.success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <p className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">
                      <CheckCircle2 className="h-4 w-4" /> {status.success}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={status.loading || !!status.success}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-4.5 text-sm font-black text-slate-950 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_15px_30px_rgba(34,211,238,0.25)]"
              >
                <div className="flex items-center justify-center gap-2">
                  {status.loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : status.success ? (
                    'Redirecting...'
                  ) : (
                    <>
                      Create Free Account
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="bg-[#0b1325] px-4 text-slate-500">Or Securely Join With</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-full flex justify-center">
                <div className="scale-110 hover:scale-115 transition-transform duration-300">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setStatus({ loading: false, error: 'Google Authentication Failed', success: '' })}
                    useOneTap
                    shape="pill"
                    theme="filled_black"
                    text="continue_with"
                  />
                </div>
              </div>

              <p className="text-center text-sm font-medium text-slate-400">
                Already part of Eligify?{' '}
                <button 
                  type="button"
                  onClick={onOpenLogin || (() => navigate('/login'))}
                  className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4 decoration-cyan-400/30"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
