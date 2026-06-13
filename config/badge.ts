// Badge configuration
// Colors match the status colors used in the application

export const BADGE_COLORS = {
  notification: {
    bg: 'bg-[#DC2626]',
    text: 'text-white',
  },
  error: {
    bg: 'bg-[#DC2626]',
    text: 'text-white',
  },
  success: {
    bg: 'bg-[#059669]',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-[#D97706]',
    text: 'text-white',
  },
} as const;

// Default badge color for unread counts (notifications, news, etc.)
// Uses the same red as status badges (#DC2626)
export const UNREAD_BADGE_COLOR = BADGE_COLORS.notification;

