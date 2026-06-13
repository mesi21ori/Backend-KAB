export interface Feedback {
  id: string;
  anonymousId: string;
  category: string;
  message: string;
  rating: number;
  date: string;
  status: 'New' | 'Reviewed' | 'Resolved';
  attachment?: string;
}

export interface FeedbackNote {
  id: string;
  feedbackId: string;
  note: string;
  date: string;
  addedBy: string;
}

export interface FeedbackFilters {
  category: string;
  dateRange: string;
  rating: string;
  status: string;
}

