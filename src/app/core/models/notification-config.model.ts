import { NotificationEventItem } from './notification-event-item.model';

export interface NotificationConfig {
  title: string;
  notifications: NotificationEventItem[];
}
