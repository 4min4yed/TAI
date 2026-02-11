/**
 * API Endpoint Definitions
 * Centralized endpoint paths for the TenderAI API Gateway
 */

const API_VERSION = "v1";

/**
 * Base API endpoints
 */
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `/api/${API_VERSION}/auth/login`,
    LOGOUT: `/api/${API_VERSION}/auth/logout`,
    REFRESH: `/api/${API_VERSION}/auth/refresh`,
    REGISTER: `/api/${API_VERSION}/auth/register`,
    VERIFY_2FA: `/api/${API_VERSION}/auth/verify-2fa`,
    ME: `/api/${API_VERSION}/auth/me`,
  },

  // Dashboard
  DASHBOARD: {
    METRICS: `/api/${API_VERSION}/dashboard/metrics`,
    ACTIVITY: `/api/${API_VERSION}/dashboard/activity`,
    TEAM_PERFORMANCE: `/api/${API_VERSION}/dashboard/team-performance`,
    CHARTS: `/api/${API_VERSION}/dashboard/charts`,
  },

  // Tenders
  TENDERS: {
    LIST: `/api/${API_VERSION}/tenders`,
    CREATE: `/api/${API_VERSION}/tenders`,
    DETAIL: (id: string) => `/api/${API_VERSION}/tenders/${id}`,
    UPDATE: (id: string) => `/api/${API_VERSION}/tenders/${id}`,
    DELETE: (id: string) => `/api/${API_VERSION}/tenders/${id}`,
    PIPELINE: `/api/${API_VERSION}/tenders/pipeline`,
    STATS: `/api/${API_VERSION}/tenders/stats`,
    BULK_UPDATE: `/api/${API_VERSION}/tenders/bulk-update`,
    ASSIGN: (id: string) => `/api/${API_VERSION}/tenders/${id}/assign`,
    STATUS: (id: string) => `/api/${API_VERSION}/tenders/${id}/status`,
  },

  // Documents
  DOCUMENTS: {
    LIST: `/api/${API_VERSION}/documents`,
    UPLOAD: `/api/${API_VERSION}/documents/upload`,
    DETAIL: (id: string) => `/api/${API_VERSION}/documents/${id}`,
    DELETE: (id: string) => `/api/${API_VERSION}/documents/${id}`,
    DOWNLOAD: (id: string) => `/api/${API_VERSION}/documents/${id}/download`,
    OCR_STATUS: (id: string) =>
      `/api/${API_VERSION}/documents/${id}/ocr-status`,
  },

  // Proposals
  PROPOSALS: {
    LIST: `/api/${API_VERSION}/proposals`,
    CREATE: `/api/${API_VERSION}/proposals`,
    DETAIL: (id: string) => `/api/${API_VERSION}/proposals/${id}`,
    UPDATE: (id: string) => `/api/${API_VERSION}/proposals/${id}`,
    DELETE: (id: string) => `/api/${API_VERSION}/proposals/${id}`,
    GENERATE: `/api/${API_VERSION}/proposals/generate`,
    EXPORT: (id: string) => `/api/${API_VERSION}/proposals/${id}/export`,
  },

  // Compliance
  COMPLIANCE: {
    CHECK: `/api/${API_VERSION}/compliance/check`,
    REPORT: (documentId: string) =>
      `/api/${API_VERSION}/compliance/report/${documentId}`,
    RULES: `/api/${API_VERSION}/compliance/rules`,
  },

  // NER (Named Entity Recognition)
  NER: {
    EXTRACT: `/api/${API_VERSION}/ner/extract`,
    ENTITIES: (documentId: string) =>
      `/api/${API_VERSION}/ner/entities/${documentId}`,
  },

  // RAG (Retrieval-Augmented Generation)
  RAG: {
    QUERY: `/api/${API_VERSION}/rag/query`,
    SIMILAR: `/api/${API_VERSION}/rag/similar`,
  },

  // Search
  SEARCH: {
    SEMANTIC: `/api/${API_VERSION}/search/semantic`,
    FULL_TEXT: `/api/${API_VERSION}/search/full-text`,
    FILTERS: `/api/${API_VERSION}/search/filters`,
  },

  // Users
  USERS: {
    LIST: `/api/${API_VERSION}/users`,
    CREATE: `/api/${API_VERSION}/users`,
    DETAIL: (id: string) => `/api/${API_VERSION}/users/${id}`,
    UPDATE: (id: string) => `/api/${API_VERSION}/users/${id}`,
    DELETE: (id: string) => `/api/${API_VERSION}/users/${id}`,
  },

  // Tenants
  TENANTS: {
    LIST: `/api/${API_VERSION}/tenants`,
    DETAIL: (id: string) => `/api/${API_VERSION}/tenants/${id}`,
    SETTINGS: (id: string) => `/api/${API_VERSION}/tenants/${id}/settings`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `/api/${API_VERSION}/notifications`,
    MARK_READ: (id: string) => `/api/${API_VERSION}/notifications/${id}/read`,
    MARK_ALL_READ: `/api/${API_VERSION}/notifications/read-all`,
    SETTINGS: `/api/${API_VERSION}/notifications/settings`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: `/api/${API_VERSION}/analytics/overview`,
    TRENDS: `/api/${API_VERSION}/analytics/trends`,
    EXPORT: `/api/${API_VERSION}/analytics/export`,
  },
} as const;

/**
 * Build endpoint with parameters
 */
export function buildEndpoint(
  endpoint: string,
  params?: Record<string, string | number>,
): string {
  let url = endpoint;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  return url;
}
