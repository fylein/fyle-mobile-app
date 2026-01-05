import { NotificationEventsEnum } from './notification-events.enum';

export interface NotificationEventItem {
  event: string;
  email: boolean;
  // Mobile push preference; optional for backward compatibility
  push?: boolean;
  eventEnum: NotificationEventsEnum;
}
