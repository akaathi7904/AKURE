(function bootstrapAkureConfig() {
  const existing = window.__AKURE_ENV__ || {};
  const onGitHubPages = window.location.hostname.endsWith('.github.io');
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const inferredBasePath = onGitHubPages && pathSegments.length ? `/${pathSegments[0]}` : '';
  const normalizedBasePath = String(existing.SITE_BASE_PATH || inferredBasePath || '')
    .replace(/\/+$/, '')
    .replace(/^([^/])/, '/$1');

  const env = {
    SUPABASE_URL: 'https://ldlxruqfqgvvclwwjfgh.supabase.co',
    SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhydXFmcWd2dmNsd3dqZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzAzMDUsImV4cCI6MjA5MTYwNjMwNX0.iWLX17xU153PxozUAQ2ZpvfzCzrzSnrfOsCNYCm8-JY',
    SITE_BASE_PATH: normalizedBasePath,
    STATIC_DEMO: onGitHubPages,
    API_BASE_URL: onGitHubPages ? '' : (normalizedBasePath ? `${normalizedBasePath}/api` : '/api'),
    ...existing,
  };

  window.__AKURE_ENV__ = env;
})();
