import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type SignInResponse = {
  message?: string;
  token?: string;
};

type FormProps = {
  signInEndpoint?: string;
  onOpenSignup?: () => void;
  onForgotPassword?: () => void;
  onSuccess?: () => void;
};

type FormDataState = {
  email: string;
  password: string;
};

type StatusState = {
  loading: boolean;
  error: string;
  success: string;
};

const Form: React.FC<FormProps> = ({
  signInEndpoint = 'http://localhost:3000/api/users/login',
  onOpenSignup,
  onForgotPassword,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormDataState>({
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
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      const response = await fetch(signInEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: SignInResponse & { error?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || data.error || 'Sign in failed. Please try again.';
        throw new Error(errorMsg);
      }

      // 1. TOKEN ALGO: Save the JWT to the browser's storage
      if (data.token) {
        localStorage.setItem('token', data.token); //
      }

      setStatus({
        loading: false,
        error: '',
        success: data.message || 'Signed in successfully.',
      });

      console.log('Sign in response:', data);
      console.log("Type of onSuccess:", typeof onSuccess);
      // 2. NAVIGATION: Trigger the redirect callback to /student-details after animation
      if (typeof onSuccess === 'function') {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        console.error("onSuccess is NOT a function! Check App.tsx props.");
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

  const handleSignupClick = () => {
    if (onOpenSignup) {
      onOpenSignup();
      return;
    }

    window.location.href = '/signup';
  };

  const handleForgotPasswordClick = () => {
    if (onForgotPassword) {
      onForgotPassword();
      return;
    }

    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1120] font-sans text-slate-100 selection:bg-cyan-500/30">
      {/* Left Side - Branding */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-8 py-16 lg:px-16 xl:px-24 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto lg:mx-0 relative z-10"
        >
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">Eligify</h1>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6 text-center lg:text-left leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Seamless access to your personalized exam hub.
          </h2>
          <p className="text-base lg:text-lg text-slate-400 text-center lg:text-left leading-relaxed">
            Eligify helps you discover, track, and prepare for academic and professional exams with intelligent tracking and comprehensive mock tests.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.45)]"
        >
          <div className="mb-8 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h3>
            <p className="text-sm text-slate-400">Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 sm:text-sm transition-all duration-200"
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl leading-5 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 sm:text-sm transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    name="remember"
                    type="checkbox"
                    onChange={handleChange}
                    className="appearance-none w-4 h-4 border border-white/20 rounded bg-slate-900 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-colors"
                  />
                  <svg className="absolute w-3 h-3 text-slate-950 left-0.5 top-0.5 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none cursor-pointer"
              >
                Forgot password?
              </button>
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
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#121B2A] rounded-full text-slate-500 border border-white/5 text-[10px] uppercase tracking-widest font-semibold">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/5 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-white/5 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 2.05.08 3.4.92 4.09 2.08-2.6 1.4-2.3 4.88.24 6.22-1.09 2.1-2.29 4.19-3 4.63zm-4.75-14.7c-.12-2.26 1.83-4.14 4.07-4.13.25 2.26-2.03 4.1-4.07 4.13z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            <div className="mt-8 text-center sm:mt-10">
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Form;
