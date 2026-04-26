import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Scale, AlertCircle, UserCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      title: '1. Acceptance of Terms',
      icon: UserCheck,
      content: 'By accessing or using Eligify, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
    },
    {
      title: '2. Eligibility Disclaimer',
      icon: AlertCircle,
      content: 'Eligify provides eligibility insights based on official notifications and your user profile. However, these are for guidance only. Official recruitment bodies have the final say. We are not responsible for any discrepancies between our engine results and official disqualifications.'
    },
    {
      title: '3. User Responsibilities',
      icon: Scale,
      content: 'You are responsible for the accuracy of the data provided in your profile. You must also monitor official exam portals for the latest updates. Eligify is a tracking tool and does not replace the need to review official notification documents.'
    },
    {
      title: '4. Service Availability',
      icon: ShieldAlert,
      content: 'We strive for 100% uptime but cannot guarantee that the service will be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the service at any time without notice.'
    },
    {
      title: '5. Intellectual Property',
      icon: FileText,
      content: 'The content, design, algorithms, and features of Eligify are the exclusive property of Eligify and its licensors. You may not reproduce, distribute, or create derivative works from our platform without express permission.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 mb-6">
            <FileText className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              Terms of Service
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
            Platform Guidelines & Agreement
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
            Please read these terms carefully before using Eligify. They define your rights and responsibilities as a candidate on our platform.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
            <span>Last Updated: April 27, 2026</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Version 1.1</span>
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 sm:p-12 backdrop-blur-xl shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileText className="h-64 w-64 text-violet-400" />
          </div>

          <div className="relative z-10 space-y-12">
            {sections.map((section, index) => (
              <motion.div 
                key={index} 
                whileHover={{ x: 10 }}
                className="group cursor-default"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400 group-hover:bg-violet-400 group-hover:text-slate-950 transition-all duration-300">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">{section.title}</h2>
                </div>
                <p className="text-slate-400 leading-relaxed pl-14 group-hover:text-slate-300 transition-colors">
                  {section.content}
                </p>
              </motion.div>
            ))}

            <div className="pt-8 border-t border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Legal Inquiries</h3>
              <p className="text-slate-400 mb-6">
                For legal notices or detailed inquiries regarding our terms, please contact:
              </p>
              <a
                href="mailto:legal@geteligify.app"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-violet-400 font-semibold hover:bg-white/10 transition-colors"
              >
                legal@geteligify.app
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
