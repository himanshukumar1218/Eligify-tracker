export const SITE_URL = 'https://geteligify.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/dashboard-banner.png`;
export const SITE_NAME = 'Eligify';

export type SeoConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const ensureMeta = (
  attr: 'name' | 'property',
  value: string,
): HTMLMetaElement => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${value}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, value);
    document.head.appendChild(element);
  }

  return element;
};

const ensureLink = (rel: string): HTMLLinkElement => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  return element;
};

const ensureJsonLdScript = (): HTMLScriptElement => {
  const selector = 'script[data-eligify-seo="json-ld"]';
  let element = document.head.querySelector<HTMLScriptElement>(selector);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.eligifySeo = 'json-ld';
    document.head.appendChild(element);
  }

  return element;
};

export const applySeo = ({
  title,
  description,
  canonicalPath,
  robots,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}: SeoConfig) => {
  const canonicalUrl = new URL(canonicalPath, `${SITE_URL}/`).toString();

  document.title = title;

  ensureMeta('name', 'description').content = description;
  ensureMeta('name', 'robots').content = robots;
  ensureMeta('name', 'theme-color').content = '#020617';

  ensureMeta('property', 'og:type').content = ogType;
  ensureMeta('property', 'og:site_name').content = SITE_NAME;
  ensureMeta('property', 'og:title').content = title;
  ensureMeta('property', 'og:description').content = description;
  ensureMeta('property', 'og:url').content = canonicalUrl;
  ensureMeta('property', 'og:image').content = ogImage;

  ensureMeta('name', 'twitter:card').content = 'summary_large_image';
  ensureMeta('name', 'twitter:title').content = title;
  ensureMeta('name', 'twitter:description').content = description;
  ensureMeta('name', 'twitter:image').content = ogImage;

  ensureLink('canonical').href = canonicalUrl;

  const jsonLdScript = ensureJsonLdScript();
  jsonLdScript.textContent = jsonLd ? JSON.stringify(jsonLd) : '';
};
