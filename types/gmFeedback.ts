export type FeedbackType = 'General' | 'Mandatory' | 'Scheduled';

export type FeedbackCategory =
  | 'Work Environment'
  | 'Communication'
  | 'Management'
  | 'Compensation'
  | 'Career Growth'
  | 'Resources'
  | 'Team Dynamics'
  | 'Other';

export interface GMFeedback {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  date: string;
  message: string;
  anonymousId?: string;
  /** Set when employee/head submits; used so they can see only their own feedback. Not shown to GM. */
  submittedBy?: string;
}

export interface FeedbackFilters {
  search: string;
  category: string;
  type: string;
  dateRange: string;
}




