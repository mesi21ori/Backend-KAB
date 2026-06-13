/**
 * Central API client for backend endpoints.
 * All methods return typed data; throw on non-OK response (caller can catch).
 */
import { useAuthStore } from '@/store/useAuthStore';
const BASE = '';

function getStoredCompanyId(): string | undefined {
  try {
    const raw = localStorage.getItem('ahadu-auth');
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    return parsed?.state?.currentUser?.companyId;
  } catch {
    return undefined;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...init } = options ?? {};

  const url =
    params && Object.keys(params).length
      ? `${BASE}${path}?${new URLSearchParams(params).toString()}`
      : `${BASE}${path}`;

  // const storeCompanyId = useAuthStore.getState().currentUser?.companyId;
  // const persistedCompanyId =
  //   typeof window !== 'undefined' ? getStoredCompanyId() : undefined;

  // const companyId = storeCompanyId ?? persistedCompanyId;

  // console.log('API COMPANY ID:', companyId);

  // const isFormData = init.body instanceof FormData;

  // const res = await fetch(url, {
  //   ...init,
  //   headers: {
  //     ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  //     ...(companyId ? { 'x-company-id': companyId } : {}),
  //     ...init.headers,
  //   },
  // });

  const currentUser = useAuthStore.getState().currentUser;

const storeCompanyId = currentUser?.companyId;

const persistedCompanyId =
  typeof window !== 'undefined'
    ? getStoredCompanyId()
    : undefined;

const companyId =
  storeCompanyId ?? persistedCompanyId;

const userId = currentUser?.id;

console.log('API COMPANY ID:', companyId);
console.log('API USER ID:', userId);

const isFormData =
  init.body instanceof FormData;

const res = await fetch(url, {
  ...init,
  headers: {
    ...(isFormData
      ? {}
      : { 'Content-Type': 'application/json' }),

    ...(companyId
      ? { 'x-company-id': companyId }
      : {}),

    ...(userId
      ? { 'x-user-id': userId }
      : {}),

    ...init.headers,
  },
});

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Request failed: ${res.status}`
    );
  }

  return data as T;
}

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: true; user: unknown } | { success: false; reason: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  changePassword: (userId: string, currentPassword: string, newPassword: string) =>
    request<{ success: true; user: unknown } | { success: false; reason: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    }),
};

// --- Users ---
export const usersApi = {
 list: (params?: { role?: string; department?: string }) =>
  request<
    Array<{
      id: string;
      companyId: string;
      fullName: string;
      email: string;
      role: string;
      isActive?: boolean;
      department?: string;
      profilePhotoUrl?: string;
      idDocumentUrl?: string;
      licenseDocumentUrl?: string;
      dateOfBirth?: string;
      nationality?: string;
      phoneNumber?: string;
      homeAddress?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelationship?: string;
      jobTitle?: string;
      employmentType?: string;
      startDate?: string;
      nationalIdPassport?: string;
      professionalLicenseNumber?: string;
      tinNumber?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      createdAt?: string;
      updatedAt?: string;
    }>
  >('/api/users', {
    params: params
      ? Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'undefined')
            .map(([k, v]) => [k, String(v)])
        )
      : undefined,
  }),
  get: (id: string) =>
    request<{
      id: string;
      fullName: string;
      email: string;
      role: string;
      legacyRole?: string;
      isActive?: boolean;
      department?: string;
      firmId?: string;
      profilePhotoUrl?: string;
      idDocumentUrl?: string;
      licenseDocumentUrl?: string;
      dateOfBirth?: string;
      nationality?: string;
      phoneNumber?: string;
      homeAddress?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelationship?: string;
      jobTitle?: string;
      employmentType?: string;
      startDate?: string;
      nationalIdPassport?: string;
      professionalLicenseNumber?: string;
      tinNumber?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
    }>('/api/users/' + id),
  create: (body: { fullName: string; email: string; role?: string; department?: string; tempPassword?: string }) =>
    request<{ id: string; fullName: string; email: string; role: string; tempPassword?: string }>('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    request<unknown>('/api/users/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/users/' + id, { method: 'DELETE' }),
};

// --- Design projects ---
export const designProjectsApi = {
 list: (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  leadArchitectId?: string;
  submittedById?: string;
  deleted?: string;
}) =>
  request<{
    data: DesignProjectApi[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/api/design-projects', {
    params: params
      ? Object.fromEntries(
          Object.entries(params)
            .filter(
              ([, v]) =>
                v !== undefined &&
                v !== null &&
                v !== '' &&
                v !== 'undefined' &&
                v !== 'null'
            )
            .map(([k, v]) => [k, String(v)])
        )
      : undefined,
  }),
  get: (id: string) => request<DesignProjectApi>('/api/design-projects/' + id),
  create: (body: Record<string, unknown>) => request<DesignProjectApi>('/api/design-projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<DesignProjectApi>('/api/design-projects/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/design-projects/' + id, { method: 'DELETE' }),
  getComments: (id: string) => request<DesignCommentApi[]>('/api/design-projects/' + id + '/comments'),
  addComment: (id: string, body: Record<string, unknown>) => request<DesignCommentApi>('/api/design-projects/' + id + '/comments', { method: 'POST', body: JSON.stringify(body) }),
  updateComment: (projectId: string, commentId: string, body: Record<string, unknown>) =>
    request<DesignCommentApi>('/api/design-projects/' + projectId + '/comments/' + commentId, { method: 'PUT', body: JSON.stringify(body) }),
  deleteComment: (projectId: string, commentId: string) =>
    request<void>('/api/design-projects/' + projectId + '/comments/' + commentId, { method: 'DELETE' }),
};

export interface DesignProjectApi {
  id: string;
  code: string;
  projectName: string;
  department: string;
  leadArchitectId?: string;
  leadArchitect: string;
  location?: string;
  designStage: string;
  designType: string;
  approvalStatus: string;
  status: string;
  priority?: string;
  progress?: number;
  startDate: string;
  endDate: string;
  submissionDate: string;
  submittedById?: string;
  submittedBy: string;
  revisionNumber: string;
  description?: string;
  lastReportedDate: string;
  remarks?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  attachments?: Array<{ id: string; name: string; type: string; url?: string; uploadedAt: string }>;
  previousVersions?: Array<{ id: string; version: string; date: string; submittedBy: string; changes?: string; url?: string }>;
  review?: { id: string; reviewedBy: string; reviewDate: string; decision?: string; approvalDate?: string; comments?: string } | null;
  commentTracker?: DesignCommentApi[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignCommentApi {
  id: string;
  no: number;
  discipline: string;
  date: string;
  commentedBy: string;
  commentedById?: string;
  comments: string;
  actionRequired: string;
  response: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Construction projects ---
export const constructionProjectsApi = {
  list: (params?: { status?: string }) =>
    request<ConstructionProjectApi[]>('/api/construction-projects', { params: params as Record<string, string> }),
  get: (id: string) => request<ConstructionProjectApi>('/api/construction-projects/' + id),
  create: (body: Record<string, unknown>) => request<ConstructionProjectApi>('/api/construction-projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<ConstructionProjectApi>('/api/construction-projects/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/construction-projects/' + id, { method: 'DELETE' }),
};

export interface ConstructionProjectApi {
  id: string;
  code: string;
  projectName: string;
  description?: string;
  status: string;
  createdBy?: { id: string; fullName: string };
  milestones?: Array<{ id: string; name: string; targetDate: string; weight: number; completed: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

// --- Site reports ---
export const siteReportsApi = {
  list: (params?: { status?: string; department?: string; projectId?: string; userId?: string; deleted?: string }) =>
    request<SiteReportApi[]>('/api/site-reports', { params: params as Record<string, string> }),
  get: (id: string) => request<SiteReportApi>('/api/site-reports/' + id),
  create: (body: Record<string, unknown>) => request<SiteReportApi>('/api/site-reports', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<SiteReportApi>('/api/site-reports/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  approve: (id: string, status: 'Approved' | 'Rejected') =>
    request<{ id: string; status: string }>('/api/site-reports/' + id + '/approve', { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => request<void>('/api/site-reports/' + id, { method: 'DELETE' }),
};

export interface SiteReportApi {
  id: string;
  projectName: string;
  projectId?: string;
  location?: string;
  submittedBy: string;
  submittedById?: string;
  position: string;
  department: string;
  submittedAt: string;
  description: string;
  status: string;
  images?: string[];
  activities?: Array<{ name: string; progress: number }>;
  materials?: string[];
  issues?: string[];
  correspondence?: Array<{ refNo: string; issuedBy: string; subject: string; hasAttachment?: boolean }>;
  changeRequests?: Array<{ id: string; request: string; requestedBy?: string; requestedAt: string }>;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// --- Letters ---
function enc(id: string) {
  return encodeURIComponent(id);
}
export const lettersApi = {
  list: (params?: { status?: string; userId?: string }) =>
    request<LetterApi[]>('/api/letters', { params: params as Record<string, string> }),
  get: (id: string) => request<LetterApi>('/api/letters/' + enc(id)),
  create: (body: Record<string, unknown>) => request<LetterApi>('/api/letters', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<LetterApi>('/api/letters/' + enc(id), { method: 'PUT', body: JSON.stringify(body) }),
  share: (id: string, userIds: string[]) =>
    request<{ sharedWith: unknown[] }>('/api/letters/' + enc(id) + '/share', { method: 'POST', body: JSON.stringify({ userIds }) }),
  delete: (id: string) => request<void>('/api/letters/' + enc(id), { method: 'DELETE' }),
};

export interface LetterApi {
  id: string;
  referenceNo: string;
  subject: string;
  body: string;
  status: string;
  createdBy: string;
  createdById?: string;
  dateCreated: string;
  sharedWith?: string[];
  sharedWithIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// --- Letter templates ---
export const letterTemplatesApi = {
  list: () => request<LetterTemplateApi[]>('/api/letter-templates'),
  get: (id: string) => request<LetterTemplateApi>('/api/letter-templates/' + id),
  create: (body: Record<string, unknown>) => request<LetterTemplateApi>('/api/letter-templates', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<LetterTemplateApi>('/api/letter-templates/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/letter-templates/' + id, { method: 'DELETE' }),
  upload: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/letter-templates/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Upload failed');
    return data as { url: string };
  },
};

export interface LetterTemplateApi {
  id: string;
  name?: string | null;
  templateType?: string;
  headerUrl?: string | null;
  footerUrl?: string | null;
  watermarkUrl?: string | null;
  headerPosition?: string;
  headerMargin?: number;
  footerHeight?: number;
  watermarkOpacity?: number;
  watermarkSize?: number;
  watermarkOffsetX?: number;
  watermarkOffsetY?: number;
  leftMargin?: number;
  rightMargin?: number;
  topMargin?: number;
  bottomMargin?: number;
  referenceCode?: string | null;
  headerHtml?: string | null;
  bodyHtml?: string | null;
  footerHtml?: string | null;
  watermarkHtml?: string | null;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// --- News ---
export const newsApi = {
  list: (params?: { category?: string }) => request<NewsApi[]>('/api/news', { params: params as Record<string, string> }),
  get: (id: string) => request<NewsApi>('/api/news/' + id),
  create: (body: Record<string, unknown>) => request<NewsApi>('/api/news', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<NewsApi>('/api/news/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/news/' + id, { method: 'DELETE' }),
};

export interface NewsApi {
  id: string;
  title: string;
  description: string;
  content?: string;
  author?: string;
  category?: string;
  image?: string;
  video?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Notifications ---
function cleanParams(obj: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== 'undefined')
      .map(([k, v]) => [k, String(v)])
  ) as Record<string, string>; // ✅ IMPORTANT CAST
}

export interface NotificationApi {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  link?: string;
  actionRequired?: boolean;
  createdAt?: string;
}

// --- Onboarding ---
export const onboardingApi = {
  listWorkflows: () => request<OnboardingWorkflowApi[]>('/api/onboarding/workflows'),
  getDocuments: (workflowId: string) => request<OnboardingDocumentApi[]>('/api/onboarding/workflows/' + workflowId + '/documents'),
  getDocument: (id: string) => request<OnboardingDocumentApi>('/api/onboarding/documents/' + id),
  createWorkflow: (body: Record<string, unknown>) => request<OnboardingWorkflowApi>('/api/onboarding/workflows', { method: 'POST', body: JSON.stringify(body) }),
  createDocument: (workflowId: string, body: Record<string, unknown>) =>
    request<OnboardingDocumentApi>('/api/onboarding/workflows/' + workflowId + '/documents', { method: 'POST', body: JSON.stringify(body) }),
  updateDocument: (id: string, body: Record<string, unknown>) =>
    request<OnboardingDocumentApi>('/api/onboarding/documents/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDocument: (id: string) => request<void>('/api/onboarding/documents/' + id, { method: 'DELETE' }),
};

export interface OnboardingWorkflowApi {
  id: string;
  name: string;
  description: string;
  isRecommended: boolean;
  documentCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingDocumentApi {
  id: string;
  workflowId: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize?: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  contentItems?: Array<{ id: string; type: string; content: string; order: number }>;
  createdAt?: string;
  updatedAt?: string;
}

// --- Project assignments (KPI) ---
export const projectAssignmentsApi = {
  list: (params?: { employeeId?: string; projectId?: string; status?: string }) =>
    request<ProjectAssignmentApi[]>('/api/project-assignments', { params: params as Record<string, string> }),
  get: (id: string) => request<ProjectAssignmentApi>('/api/project-assignments/' + id),
  create: (body: Record<string, unknown>) => request<ProjectAssignmentApi>('/api/project-assignments', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<ProjectAssignmentApi>('/api/project-assignments/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  addProgress: (id: string, date: string, progress: number) =>
    request<{ id: string; date: string; progress: number }>('/api/project-assignments/' + id + '/progress', { method: 'POST', body: JSON.stringify({ date, progress }) }),
  delete: (id: string) => request<void>('/api/project-assignments/' + id, { method: 'DELETE' }),
};

// --- Project priority changes (KPI) ---
export const projectPriorityChangesApi = {
  list: (params?: { projectId?: string; employeeId?: string }) =>
    request<ProjectPriorityChangeApi[]>('/api/project-priority-changes', { params: params as Record<string, string> }),
  create: (body: { projectId: string; projectName?: string; employeeId: string; oldPriority: string; newPriority: string; changedById: string; reason?: string }) =>
    request<ProjectPriorityChangeApi>('/api/project-priority-changes', { method: 'POST', body: JSON.stringify(body) }),
};

export interface ProjectPriorityChangeApi {
  id: string;
  projectId: string;
  employeeId: string;
  oldPriority: string;
  newPriority: string;
  changedBy: string;
  changedById?: string;
  reason?: string;
  createdAt?: string;
}

export interface ProjectAssignmentApi {
  id: string;
  employeeId: string;
  projectId: string;
  projectName?: string;
  project?: { id: string; projectName: string };
  employee?: { id: string; fullName: string };
  status: string;
  urgency: string;
  startedAt: string;
  deadline: string;
  pausedAt?: string | null;
  completedAt?: string | null;
  pausedReason?: string | null;
  progressHistory?: Array<{ date: string; progress: number }>;
  createdAt?: string;
  updatedAt?: string;
}

// --- Favorites ---
export const favoritesApi = {
  list: (userId: string) => request<FavoriteApi[]>('/api/favorites', { params: { userId } }),
  add: (body: { userId: string; type: string; refId: string; name: string; url: string }) =>
    request<FavoriteApi>('/api/favorites', { method: 'POST', body: JSON.stringify(body) }),
  remove: (userId: string, type: string, refId: string) =>
    request<void>('/api/favorites', { method: 'DELETE', params: { userId, type, refId } }),
};

export interface FavoriteApi {
  id: string;
  type: string;
  refId: string;
  name: string;
  url: string;
  addedAt: string;
}

// --- Feedback ---
export const feedbackApi = {
  list: (params?: { status?: string; category?: string }) =>
    request<FeedbackApi[]>('/api/feedback', { params: params as Record<string, string> }),
  get: (id: string) => request<FeedbackApi>('/api/feedback/' + id),
  create: (body: Record<string, unknown>) => request<FeedbackApi>('/api/feedback', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string) => request<FeedbackApi>('/api/feedback/' + id, { method: 'PUT', body: JSON.stringify({ status }) }),
  addNote: (id: string, note: string, addedById: string) =>
    request<{ id: string; note: string; date: string; addedBy: string }>('/api/feedback/' + id + '/notes', { method: 'POST', body: JSON.stringify({ note, addedById }) }),
};

export interface FeedbackApi {
  id: string;
  anonymousId: string;
  category: string;
  message: string;
  rating: number;
  date: string;
  status: string;
  notes?: Array<{ id: string; note: string; addedBy: string }>;
  createdAt?: string;
  updatedAt?: string;
}

// --- GM Feedback ---
export const gmFeedbackApi = {
  list: (params?: { type?: string; category?: string; submittedById?: string }) =>
    request<GMFeedbackApi[]>('/api/gm-feedback', { params: params as Record<string, string> }),
  create: (body: Record<string, unknown>) => request<GMFeedbackApi>('/api/gm-feedback', { method: 'POST', body: JSON.stringify(body) }),
};

export interface GMFeedbackApi {
  id: string;
  type: string;
  category: string;
  date: string;
  message: string;
  anonymousId?: string;
  submittedById?: string;
  createdAt?: string;
}

// --- Deletion requests ---
export const deletionRequestsApi = {
  list: (params?: { status?: string; requestedById?: string }) =>
    request<DeletionRequestApi[]>('/api/deletion-requests', { params: params as Record<string, string> }),
  get: (id: string) => request<DeletionRequestApi>('/api/deletion-requests/' + id),
  create: (body: { type: string; itemId: string; itemName: string; requestedById: string }) =>
    request<DeletionRequestApi>('/api/deletion-requests', { method: 'POST', body: JSON.stringify(body) }),
  approve: (id: string, reviewedById: string) =>
    request<{ id: string; status: string; reviewedBy: string; reviewedAt?: string }>('/api/deletion-requests/' + id + '/approve', { method: 'POST', body: JSON.stringify({ reviewedById }) }),
  reject: (id: string, reviewedById: string, rejectionReason?: string) =>
    request<{ id: string; status: string; reviewedBy: string; rejectionReason?: string }>('/api/deletion-requests/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reviewedById, rejectionReason }) }),
};

export interface DeletionRequestApi {
  id: string;
  type: string;
  itemId: string;
  itemName: string;
  requestedBy: string;
  requestedById?: string;
  requestedAt: string;
  status: string;
  reviewedBy?: string;
  reviewedById?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Employees (onboarding) ---
export const employeesApi = {
  onboard: (body: Record<string, unknown>) =>
    request<{
      user: { id: string; fullName: string; email: string; role: string; department?: string; firmId?: string; createdAt?: string; updatedAt?: string };
      uploads: { photoUrl: string | null; idDocumentUrl: string | null; licenseDocumentUrl: string | null };
    }>('/api/employees/onboard', { method: 'POST', body: JSON.stringify(body) }),
};

// --- User password reset (temp) ---
export const userSecurityApi = {
  resetTempPassword: (userId: string) =>
    request<{ success: boolean }>(
      '/api/users/' + userId + '/reset-temp-password',
      { method: 'POST' }
    ),
  deactivateUser: (userId: string) =>
    request<{ success: boolean }>(
      '/api/users/' + userId + '/deactivate',
      { method: 'POST' }
    ),
};

export const notificationsApi = {
  list: (userId: string, params?: { isRead?: string; category?: string }) =>
    request<NotificationApi[]>('/api/notifications', {
      params: cleanParams({
        userId,
        isRead: params?.isRead,
        category: params?.category,
      }),
    }),

  get: (id: string) =>
    request<NotificationApi>('/api/notifications/' + id),

  markRead: (id: string) =>
    request<{ id: string; isRead: boolean }>(
      '/api/notifications/' + id + '/read',
      { method: 'PATCH' }
    ),
};

// --- Firms ---
export const firmsApi = {
  list: (params?: { type?: string }) => request<FirmApi[]>('/api/firms', { params: params as Record<string, string> }),
  get: (id: string) => request<FirmApi>('/api/firms/' + id),
  create: (body: Record<string, unknown>) => request<FirmApi>('/api/firms', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) => request<FirmApi>('/api/firms/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>('/api/firms/' + id, { method: 'DELETE' }),
};

export interface FirmApi {
  id: string;
  name: string;
  type: string;
  description?: string;
  slug?: string;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
