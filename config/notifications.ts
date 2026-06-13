import { Notification } from '@/types/notification';

export function createProjectNotification(
  projectName: string,
  employeeIds: string[],
  priority: string
): Notification[] {
  const priorityEmojis: Record<string, string> = {
    Low: '📌',
    Medium: '⚠️',
    High: '🔥',
    Urgent: '🚨',
  };

  return employeeIds.map((employeeId) => ({
    id: `NOTIF-${Date.now()}-${employeeId}`,
    title: `${priorityEmojis[priority] || '📋'} New Design Project Assigned`,
    message: `You have been assigned to the project "${projectName}". Priority: ${priority}`,
    type: priority === 'Urgent' || priority === 'High' ? 'warning' : 'info',
    category: 'project' as const,
    isRead: false,
    createdAt: new Date().toISOString(),
    link: `/dashboard/projects/design/${encodeURIComponent(projectName)}`,
    actionRequired: priority === 'Urgent' || priority === 'High',
  }));
}











