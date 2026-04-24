import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, type SeoConfig } from '../utils/seo';

const landingJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description:
      'Eligify helps candidates check government exam eligibility, track deadlines, and manage exam opportunities from one profile.',
    image: DEFAULT_OG_IMAGE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
  },
];

const getSeoConfig = (pathname: string): SeoConfig => {
  // Public Landing Pages
  if (pathname === '/' || pathname === '/landing') {
    return {
      title: 'Eligify | Government Exam Eligibility Checker & Alerts',
      description:
        'Check your government exam eligibility, track deadlines, and manage documents with one profile on Eligify.',
      canonicalPath: '/',
      robots: 'index,follow',
      jsonLd: landingJsonLd,
    };
  }

  // Auth Pages
  if (pathname === '/login') {
    return {
      title: 'Sign In | Eligify',
      description:
        'Sign in to Eligify to access your government exam eligibility dashboard, alerts, and application tools.',
      canonicalPath: '/login',
      robots: 'noindex,follow',
    };
  }

  if (pathname === '/signup') {
    return {
      title: 'Create Your Eligify Account | Eligify',
      description:
        'Create an Eligify account to track government exam eligibility, deadlines, and your application-ready profile.',
      canonicalPath: '/signup',
      robots: 'noindex,follow',
    };
  }

  // Student Dashboard Routes (Authenticated)
  if (pathname === '/dashboard') {
    return {
      title: 'Exam Dashboard | Eligify',
      description: 'View your personalized exam eligibility, upcoming deadlines, and tracking progress.',
      canonicalPath: '/dashboard',
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/eligible-exams') {
    return {
      title: 'My Eligible Exams | Eligify',
      description: 'Browse all government exams you are currently eligible for based on your profile.',
      canonicalPath: '/eligible-exams',
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/prep-tracker') {
    return {
      title: 'Preparation Tracker | Eligify',
      description: 'Track your preparation status and milestones for your targeted government exams.',
      canonicalPath: '/prep-tracker',
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/documents') {
    return {
      title: 'Document Wallet | Eligify',
      description: 'Securely manage and access your essential documents for exam applications.',
      canonicalPath: '/documents',
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/my-profile') {
    return {
      title: 'My Profile | Eligify',
      description: 'Manage your personal details, educational qualifications, and exam preferences.',
      canonicalPath: '/my-profile',
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/notifications') {
    return {
      title: 'Notifications & Alerts | Eligify',
      description: 'Stay updated with latest exam notifications, eligibility matches, and deadline reminders.',
      canonicalPath: '/notifications',
      robots: 'noindex,nofollow',
    };
  }

  // Admin Routes
  if (pathname.startsWith('/admin')) {
    return {
      title: 'Admin Console | Eligify',
      description: 'Administrative tools for managing exam data and reviewing discovered exams.',
      canonicalPath: pathname,
      robots: 'noindex,nofollow',
    };
  }

  // Fallback
  return {
    title: SITE_NAME,
    description:
      'Eligify helps candidates manage government exam eligibility, notifications, and exam workflows in one place.',
    canonicalPath: pathname,
    robots: 'noindex,nofollow',
  };
};

const RouteSeo = () => {
  const location = useLocation();

  useEffect(() => {
    applySeo(getSeoConfig(location.pathname));
  }, [location.pathname]);

  return null;
};

export default RouteSeo;
