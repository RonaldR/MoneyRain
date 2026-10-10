const MEASUREMENT_ID = 'G-ELM15JYBXJ';

/** Google Analytics, only wired up in production builds. */
export function initAnalytics() {
  if (!import.meta.env.PROD) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag needs the actual arguments object, not an array
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}
