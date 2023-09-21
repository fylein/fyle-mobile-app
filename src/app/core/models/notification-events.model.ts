import { EmailEvents as EE } from './org-settings.model';

export type EmailEvents = {
  email: {
    selected: boolean;
  };
  eventType: string | EE;
  feature: string;
  push: {
    selected: boolean;
  };
  selected: boolean;
  textLabel: string;
};

export interface NotificationEvents {
  events: EmailEvents[];
  features: {
    advances: {
      selected: boolean;
      textLabel: string;
    };
    expensesAndReports: {
      selected: boolean;
      textLabel: string;
    };
  };
}

export interface NotificationEventFeatures {
  advances: {
    selected: boolean;
    textLabel: string;
  };
  expensesAndReports: {
    selected: boolean;
    textLabel: string;
  };
}
