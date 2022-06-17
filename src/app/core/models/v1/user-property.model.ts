export interface DeviceInfo {
  id: string;
  fcm_token: string;
}

export interface UserProperty {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  devices?: DeviceInfo[];
  reports_beta_view?: {
    allowed: boolean;
    enabled: boolean;
  };
  company_expenses_beta?: {
    allowed: boolean;
    enabled: boolean;
  };
  expense_form_beta?: any;
}
