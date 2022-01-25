export interface AutoFyleSettings {
  allowed: boolean;
  enabled: boolean;
  background_enabled: boolean;
}

export interface AnnualMileageOfUserBeforeJoiningFyle {
  two_wheeler: number;
  four_wheeler: number;
  four_wheeler1: number;
  four_wheeler3: number;
  four_wheeler4: number;
  bicycle: number;
  electric_car: number;
}

export interface MileageSettings {
  mileage_rate_labels?: any;
  annual_mileage_of_user_before_joining_fyle: AnnualMileageOfUserBeforeJoiningFyle;
}

export interface CostCenterSettings {
  default_cost_center_id?: any;
  default_cost_center_name?: any;
}

export interface PerDiemRateSettings {
  allowed_per_diem_ids: any[];
}

export interface AccessDelegationSettings {
  allowed: boolean;
}

export interface InstaFyleSettings {
  allowed: boolean;
  enabled: boolean;
  static_camera_overlay_enabled: boolean;
  extract_fields: string[];
}

export interface BulkFyleSettings {
  allowed: boolean;
  enabled: boolean;
}

export interface GmailFmrSettings {
  allowed: boolean;
  enabled: boolean;
}

export interface TripRequestOrgUserSettings {
  enabled: boolean;
}

export interface WhatsappFyleSettings {
  allowed: boolean;
  enabled: boolean;
}

export interface SmsFyleSettings {
  allowed: boolean;
  enabled: boolean;
}

export interface OneClickActionSettings {
  enabled: boolean;
  allowed: boolean;
  module?: any;
}

export interface Email {
  allowed: boolean;
  enabled: boolean;
  unsubscribed_events: string[];
}

export interface Push {
  allowed: boolean;
  enabled: boolean;
  unsubscribed_events: string[];
}

export interface Whatsapp {
  allowed: boolean;
  enabled: boolean;
  unsubscribed_events?: any;
}

export interface NotificationSettings {
  email: Email;
  push: Push;
  whatsapp: Whatsapp;
  notify_delegatee: boolean;
  notify_user: boolean;
}

export interface CurrencySettings {
  enabled: boolean;
  preferred_currency: string;
}

export interface Preferences {
  default_project_id?: number;
  default_vehicle_type?: string;
  default_payment_mode?: string;
}

export interface Locale {
  timezone: string;
  abbreviation: string;
  offset: string;
}

export interface InAppChatSettings {
  allowed: boolean;
  enabled: boolean;
  restore_id?: any;
}

export interface ExpenseFormAutofills {
  allowed: boolean;
  enabled: boolean;
}
export interface PersonalCardsSettings {
  enabled: boolean;
  personal_cards_data_aggregator: string;
}

export interface OrgUserSettings {
  id: string;
  created_at: Date;
  updated_at: Date;
  org_user_id: string;
  auto_fyle_settings: AutoFyleSettings;
  mileage_settings: MileageSettings;
  cost_center_ids: any[];
  project_ids: number[];
  cost_center_settings: CostCenterSettings;
  per_diem_rate_settings: PerDiemRateSettings;
  access_delegation_settings: AccessDelegationSettings;
  insta_fyle_settings: InstaFyleSettings;
  bulk_fyle_settings: BulkFyleSettings;
  gmail_fmr_settings: GmailFmrSettings;
  trip_request_org_user_settings: TripRequestOrgUserSettings;
  whatsapp_fyle_settings: WhatsappFyleSettings;
  sms_fyle_settings: SmsFyleSettings;
  one_click_action_settings: OneClickActionSettings;
  notification_settings: NotificationSettings;
  currency_settings: CurrencySettings;
  preferences: Preferences;
  locale: Locale;
  in_app_chat_settings: InAppChatSettings;
  expense_form_autofills: ExpenseFormAutofills;
  personal_cards_settings: PersonalCardsSettings;
}
