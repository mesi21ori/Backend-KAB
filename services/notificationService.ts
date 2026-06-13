import { Notification } from '@/types/notification';
import { mockNotifications } from '@/app/dashboard/notification/data/mockNotifications';

export function addNotifications(notifications: Notification[]): void {
  mockNotifications.unshift(...notifications);
}

export function getNotificationsForEmployee(employeeId: string): Notification[] {
  return mockNotifications.filter((notif) => notif.id.includes(employeeId));
}











