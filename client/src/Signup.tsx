import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type SignupResponse = {
  message?: string;
  token?: string;
};

type SignupProps = {
  signupEndpoint?: string;
  onOpenLogin?: () => void;
  onSuccess?: () => void;
};

type SignupFormState = {
  username: string;
  email: string;
  password: string;
};

type StatusState = {
  loading: boolean;
  error: string;
  success: string;
};

const Signup: React.FC<SignupProps> = ({
  signupEndpoint = 'http://localhost:3000/api/users/signup',
  onOpenLogin,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<SignupFormState>({
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({
    loading: false,
    error: '',
    success: '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus({
      loading: true,
      error: '',
      success: '',
    });

    try {
      const response = await fetch(signupEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: SignupResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((data as any).message || (data as any).error || 'Signup failed. Please try again.');
      }

      // 1. TOKEN ALGO: Save the JWT from the signup response
      // Many professional backends log the user in immediately after signup
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setStatus({
        loading: false,
        error: '',
        success: data.message || 'Account created successfully.',
      });

      // 2. NAVIGATION: Trigger the redirect to student details after animation
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';

      setStatus({
        loading: false,
        error: message,
        success: '',
      });
    }
  };

  const handleLoginClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
      return;
    }

    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Global Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>
      {/* Left Side - Branding & Features */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-8 py-12 lg:px-12 xl:px-24 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        {/* Local Background Effects */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto lg:mx-0 relative z-10"
        >
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">Eligify</h1>
          </div>

          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-8 text-center lg:text-left text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Welcome to the future of exam tracking.
          </h2>
          
          <ul className="space-y-4 lg:space-y-5 flex flex-col items-center lg:items-start w-full">
            <li className="flex items-center space-x-4 w-full p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:border-cyan-500/30 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-base lg:text-lg group-hover:text-white transition-colors">Find exams you are eligible for</span>
            </li>
            <li className="flex items-center space-x-4 w-full p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:border-purple-500/30 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-base lg:text-lg group-hover:text-white transition-colors">Track critical deadlines</span>
            </li>
            <li className="flex items-center space-x-4 w-full p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:border-emerald-500/30 group">
               <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-base lg:text-lg group-hover:text-white transition-colors">Get real-time notifications</span>
            </li>
            <li className="flex items-center space-x-4 w-full p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:border-amber-500/30 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-base lg:text-lg group-hover:text-white transition-colors">Take full-length mock tests</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background glow effect for modern feel */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.45)]"
        >
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create an account</h2>
            <p className="text-sm text-slate-400">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 sm:text-sm transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 sm:text-sm transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl leading-5 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 sm:text-sm transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 ml-1">
                <svg className="w-3.5 h-3.5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Password should only contain letters and digits (no special characters).
              </p>
            </div>

            {status.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 mt-4 flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {status.error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={status.loading || !!status.success}
              className={`w-full flex justify-center py-3 px-4 border border-transparent shadow-[0_0_20px_rgba(34,211,238,0.2)] text-sm font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-500 transform cursor-pointer mt-6 ${
                status.success 
                  ? 'bg-emerald-400 hover:bg-emerald-300 focus:ring-emerald-400 rounded-full scale-[1.02]' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:ring-cyan-400 rounded-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {status.success ? (
                <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Success</span>
                </div>
              ) : status.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="mt-8 text-center sm:mt-10">
              <span className="text-sm text-slate-400">Already have an account?</span>
              <button
                type="button"
                onClick={handleLoginClick}
                className="ml-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
               >
                Login
              </button>
             </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
