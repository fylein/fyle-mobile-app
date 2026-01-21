import { NotificationEventsEnum } from './notification-events.enum';

export interface NotificationEventItem {
  event: string;
  email: boolean;
  push?: boolean;
  eventEnum: NotificationEventsEnum;
}
