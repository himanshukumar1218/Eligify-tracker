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
      title: 'Create Your Eligify Account',
      description:
        'Create an Eligify account to track government exam eligibility, deadlines, and your application-ready profile.',
      canonicalPath: '/signup',
      robots: 'noindex,follow',
    };
  }

  return {
    title: 'Eligify App',
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
