export interface ChangeRequest {
  id: string;
  request: string;
  requestedBy: string;
  requestedAt: string;
}

export interface SiteReport {
  id: string;
  projectName: string;
  location?: string;
  submittedBy: string;
  position: string;
  department: 'Design' | 'Construction';
  submittedAt: string;
  description: string;
  images: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  activities?: { name: string; progress: number }[];
  materials?: string[];
  issues?: string[];
  correspondence?: {
    refNo: string;
    issuedBy: string;
    subject: string;
    hasAttachment: boolean;
  }[];
  changeRequests?: ChangeRequest[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface SiteReportFilters {
  status: 'All' | 'Pending' | 'Approved' | 'Rejected';
  department: 'All' | 'Design' | 'Construction';
  dateRange: 'week' | 'month' | 'all';
  search: string;
}

export interface ReportSummary {
  totalReports: number;
  activeProjects: string[];
  issuesFlagged: number;
  period: 'week' | 'month';
}

