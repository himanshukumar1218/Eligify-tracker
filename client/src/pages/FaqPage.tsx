import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowLeft, Plus, Minus, Search, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const faqs = [
  {
    question: "What is Eligify and how does it help me?",
    answer: "Eligify is an intelligent eligibility engine designed for government exam candidates. It automatically matches your profile (academic, personal, and category data) against official notifications to tell you exactly which exams you can apply for, saving you from reading hundreds of pages of notifications."
  },
  {
    question: "Is the eligibility data 100% accurate?",
    answer: "We strive for maximum accuracy by regularly updating our engine based on official notifications. However, we always recommend reviewing the official PDF linked in our alerts before making a final application. Eligify is a powerful tracking tool, but the recruiting body has the final authority."
  },
  {
    question: "How do the deadline alerts work?",
    answer: "Once you create a profile, our system tracks the opening and closing dates for all matching exams. You will receive proactive notifications via your dashboard and email as deadlines approach, ensuring you never miss an opportunity again."
  },
  {
    question: "Is my personal data secure on Eligify?",
    answer: "Absolutely. We use industry-standard encryption to protect your academic and personal information. We use Google OAuth for secure login and never share your identifiable data with third parties without your explicit consent."
  },
  {
    question: "Can I track state-level exams as well?",
    answer: "Yes! Eligify tracks both Central (UPSC, SSC, Banking) and major State-level government exams. We are constantly expanding our database to include more state notifications."
  },
  {
    question: "What documents should I upload to the wallet?",
    answer: "You should upload essential documents like 10th/12th marksheets, Degree certificates, and Category/Caste certificates. Our Smart Wallet helps you manage these and ensures they are ready for official portal uploads."
  }
];

const FaqPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 mb-6"
          >
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Frequently Asked Questions
            </span>
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-8">
            How can we <span className="text-cyan-400">help you</span> today?
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 py-4 pl-12 pr-4 text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-20">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, x: 2 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 ${
                  activeIndex === index 
                    ? 'border-cyan-500/30 bg-slate-900/60 shadow-[0_0_30px_rgba(34,211,238,0.05)]' 
                    : 'border-white/10 bg-slate-900/40 hover:border-cyan-500/30'
                }`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-white">{faq.question}</span>
                  {activeIndex === index ? (
                    <Minus className="h-5 w-5 text-cyan-400 shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-8 sm:p-12 text-center backdrop-blur-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 mx-auto mb-6">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Our team is here to help you navigate your government exam journey. Don't hesitate to reach out!
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="rounded-xl bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 hover:scale-105"
          >
            Contact Support
          </button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default FaqPage;
