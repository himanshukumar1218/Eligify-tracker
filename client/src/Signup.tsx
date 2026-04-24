import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE } from './utils/api';

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
    setStatus({ loading: true, error: '', success: '' });
    try {
      const response = await fetch(signupEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data: SignupResponse = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as any).message || (data as any).error || 'Signup failed.');
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setStatus({ loading: false, error: '', success: data.message || 'Success!' });
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Something went wrong.',
        success: '',
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setStatus({ loading: true, error: '', success: '' });
    try {
      const response = await fetch(`${API_BASE}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Google signup failed.');
      if (data.token) localStorage.setItem('token', data.token);
      setStatus({ loading: false, error: '', success: 'Account created with Google!' });
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Google authentication failed.',
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-8 py-12 lg:px-12 xl:px-24 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
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
          <ul className="space-y-4 lg:space-y-5 flex flex-col items-center lg:items-start w-full text-slate-300">
             <li className="flex items-center space-x-3"><span>Find exams</span></li>
             <li className="flex items-center space-x-3"><span>Track deadlines</span></li>
             <li className="flex items-center space-x-3"><span>Mock tests</span></li>
          </ul>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text" required value={formData.username} onChange={handleChange}
                className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">Password</label>
              <input
                id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
                className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-slate-950/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <button
              type="submit" disabled={status.loading || !!status.success}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-bold text-slate-950 mt-4"
            >
              {status.loading ? 'Creating...' : status.success ? 'Success!' : 'Sign Up'}
            </button>

            <div className="mt-8">
              <div className="relative flex justify-center text-sm mb-4">
                <span className="px-2 bg-slate-950 text-slate-500">Or continue with</span>
              </div>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setStatus({ loading: false, error: 'Failed', success: '' })}
                theme="filled_blue" shape="pill" width="100%" text="signup_with"
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Already have an account? <button type="button" onClick={handleLoginClick} className="text-cyan-400">Login</button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
