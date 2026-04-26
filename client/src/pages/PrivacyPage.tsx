import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const sections = [
    {
      title: '1. Information We Collect',
      icon: Eye,
      content: 'We collect information you provide directly to us when you create an account, build your eligibility profile, or communicate with us. This includes personal details (name, email), academic qualifications, category/caste status, and domicile information necessary for exam eligibility calculations.'
    },
    {
      title: '2. How We Use Your Information',
      icon: ShieldCheck,
      content: 'Your data is primarily used to calculate your eligibility for various government exams. We also use it to send you personalized alerts about upcoming deadlines, new exam notifications that match your profile, and to improve our eligibility engine algorithms.'
    },
    {
      title: '3. Data Security',
      icon: Lock,
      content: 'We implement industry-standard security measures to protect your personal information. All sensitive data is encrypted at rest and in transit. While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet is 100% secure.'
    },
    {
      title: '4. Third-Party Services',
      icon: Globe,
      content: 'We use Google OAuth for secure authentication. We do not sell your personal data to third parties. We may share anonymized, aggregated data for analytical purposes to improve our services.'
    },
    {
      title: '5. Your Data Rights',
      icon: FileText,
      content: 'You have the right to access, update, or delete your personal information at any time through your profile settings. You can also export your data or request a complete account deletion by contacting our support team.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-12 group"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 mb-6">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Privacy Policy
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
            Your Privacy Matters to Us
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
            At Eligify, we are committed to protecting your personal data and being transparent about how we use it to help you secure your future in government services.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
            <span>Last Updated: April 27, 2026</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Version 2.0</span>
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
            <ShieldCheck className="h-64 w-64 text-cyan-400" />
          </div>

          <div className="relative z-10 space-y-12">
            {sections.map((section, index) => (
              <motion.div 
                key={index} 
                whileHover={{ x: 10 }}
                className="group cursor-default"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all duration-300">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{section.title}</h2>
                </div>
                <p className="text-slate-400 leading-relaxed pl-14 group-hover:text-slate-300 transition-colors">
                  {section.content}
                </p>
              </motion.div>
            ))}

            <div className="pt-8 border-t border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
              <p className="text-slate-400 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please reach out to our Data Protection Officer:
              </p>
              <a
                href="mailto:privacy@geteligify.app"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-cyan-400 font-semibold hover:bg-white/10 transition-colors"
              >
                privacy@geteligify.app
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
