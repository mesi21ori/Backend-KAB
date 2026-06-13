export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'project' | 'report' | 'letter' | 'system' | 'approval';
  isRead: boolean;
  createdAt: string;
  link?: string;
  actionRequired?: boolean;
}

export interface NotificationFilters {
  type: 'all' | 'info' | 'success' | 'warning' | 'error';
  category: 'all' | 'project' | 'report' | 'letter' | 'system' | 'approval';
  status: 'all' | 'read' | 'unread';
}

