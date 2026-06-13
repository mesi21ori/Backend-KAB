export const CONSTRUCTION_STATUSES = [
  'Active',
  'Pending',
  'Completed',
] as const;

export type ConstructionStatus = typeof CONSTRUCTION_STATUSES[number];

export const STATUS_COLORS = {
  'Active': {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    border: 'border border-[#059669]',
  },
  'Pending': {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    border: 'border border-[#D97706]',
  },
  'Completed': {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    border: 'border border-[#DC2626]',
  },
} as const;

