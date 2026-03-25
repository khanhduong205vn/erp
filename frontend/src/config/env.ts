/**
 * Centralized environment configuration.
 * All API URLs and app-level constants flow from this single source.
 */
export const config = {
  apiBaseUrl: '/api',
  appName: 'ERP System',
  appDescription: 'Enterprise Resource Planning',
  version: 'v1.0.0',
  buildDate: '24/03/2026',
  techStack: 'React + TypeScript + Tailwind CSS',
  tokenKey: 'erp_token',
  userKey: 'erp_user',
} as const;
