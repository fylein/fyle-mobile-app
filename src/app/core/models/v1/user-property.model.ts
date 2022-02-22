export interface DeviceInfo {
  id: string;
  fcm_token: string;
}

export interface Setting {
  enabled: boolean;
  allowed: boolean;
}

export interface UserProperty {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  devices?: DeviceInfo[];
  reports_beta_view?: Setting;
  company_expenses_beta?: Setting;
  expense_form_beta?: Setting;
}
