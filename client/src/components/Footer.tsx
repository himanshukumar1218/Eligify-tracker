import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Send,
  ExternalLink,
  Mail,
  MapPin,
  Heart
} from 'lucide-react';

const Github = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const Twitter = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const Instagram = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '#' },
    ],
    developer: [
      { name: 'View Source', href: 'https://github.com/himanshukumar1218/Eligify-tracker', icon: Github },
    ]
  };

  const socials = [
    { name: 'X', icon: Twitter, href: 'https://x.com/geteligify', color: 'hover:text-[#1DA1F2]' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/geteligify/', color: 'hover:text-[#E4405F]' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/himanshukumar1218', color: 'hover:text-[#f0f6fc]' },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-[#020617] pt-20 pb-10 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-600/5 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Eligify</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
              Empowering candidates to navigate the complex world of government exams with precision, transparency, and AI-driven eligibility insights.
            </p>

            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-400 transition-all duration-300 ${social.color} hover:border-cyan-500/30 hover:bg-cyan-500/5`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-8 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => {
                  const isInternal = link.href.startsWith('/');
                  return (
                    <li key={link.name}>
                      {isInternal ? (
                        <Link
                          to={link.href}
                          className="text-slate-400 text-sm hover:text-cyan-400 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 text-sm hover:text-cyan-400 transition-colors duration-200"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-white font-semibold mb-6">Developer</h3>
              <ul className="space-y-4">
                {footerLinks.developer.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 text-sm hover:text-cyan-400 transition-colors duration-200"
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.name}
                    </a>
                  </li>
                ))}
                <li>
                  <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Recruitment</p>
                    <p className="text-xs text-slate-300 mb-3">Interested in my work?</p>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Hire the Developer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-2 text-slate-500 text-xs">
            <span>© {currentYear} Eligify. All rights reserved.</span>
            {footerLinks.legal.map(link => {
              const isInternal = link.href.startsWith('/');
              if (isInternal) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="hover:text-slate-300 transition-colors"
                  >
                    {link.name}
                  </Link>
                );
              }
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 transition-colors"
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Built with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>by</span>
            <a
              href="https://github.com/himanshukumar1218"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-300 hover:text-cyan-400 transition-colors underline decoration-cyan-500/30 underline-offset-4"
            >
              Himanshu Kumar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
