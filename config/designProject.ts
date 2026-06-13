export const DESIGN_DEPARTMENTS = [
  'Design',
  'Architecture',
  'Engineering',
] as const;

export const DESIGN_STAGES = [
  'Concept',
  'Schematic',
  'Design Development',
  'Detailed Design',
  'Construction Docs',
] as const;

export const DESIGN_TYPES = [
  'Architectural',
  'Mixed-Use',
  'Infrastructure',
  'Cultural',
  'Corporate',
  'Residential',
  'Commercial',
] as const;

export const PRIORITIES = [
  'Low',
  'Medium',
  'High',
] as const;

export const APPROVAL_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
] as const;

export const PROJECT_STATUSES = [
  'active',
  'completed',
  'pending',
] as const;

export const ACCEPTED_FILE_TYPES = [
  '.pdf',
  '.dwg',
  '.png',
  '.jpg',
  '.jpeg',
  '.zip',
  '.xlsx',
  '.docx',
] as const;

export const FILE_TYPE_LABELS: Record<string, string> = {
  '.pdf': 'PDF',
  '.dwg': 'DWG',
  '.png': 'PNG',
  '.jpg': 'JPG',
  '.jpeg': 'JPEG',
  '.zip': 'ZIP',
  '.xlsx': 'XLSX',
  '.docx': 'DOCX',
};

export type DesignDepartment = typeof DESIGN_DEPARTMENTS[number];
export type DesignStage = typeof DESIGN_STAGES[number];
export type DesignType = typeof DESIGN_TYPES[number];
export type Priority = typeof PRIORITIES[number];
export type ApprovalStatus = typeof APPROVAL_STATUSES[number];
export type ProjectStatus = typeof PROJECT_STATUSES[number];

// Deletion Request Status Colors
export const DELETION_REQUEST_STATUS_COLORS = {
  'Pending': {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    border: 'border border-[#D97706]',
  },
  'Approved': {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    border: 'border border-[#059669]',
  },
  'Rejected': {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    border: 'border border-[#DC2626]',
  },
  'No Request': {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    border: 'border border-[#2563EB]',
  },
} as const;











