import { NotificationEventsEnum } from './notification-events.enum';

export interface NotificationEventItem {
  event: string;
  email: boolean;
  mobile?: boolean;
  eventEnum: NotificationEventsEnum;
}
