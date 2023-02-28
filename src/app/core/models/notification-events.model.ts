export type EmailEvents = {
  email: {
    selected: boolean;
  };
  eventType: string;
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
