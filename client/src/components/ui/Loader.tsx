import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = true, text = "Eligify" }) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-slate-950 ${fullScreen ? 'fixed inset-0 z-[9999]' : 'h-full w-full min-h-[300px]'}`}>
      <div className="relative">
        {/* Outer pulsing glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl"
        />
        
        {/* Main spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-t-2 border-r-2 border-cyan-400 border-b-transparent border-l-transparent"
        />
        
        {/* Inner static logo circle */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <span className="text-sm font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">E</span>
           </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-cyan-400/60">
          {text}
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="h-1 w-1 rounded-full bg-cyan-400/40"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Loader;
