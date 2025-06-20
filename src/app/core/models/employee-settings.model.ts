import { AccountType } from '../enums/account-type.enum';
import { CommonEmployeeSettings } from './common-employee-settings.model';
import { MileageSettings } from './mileage-settings.model';
import { Locale } from './locale.model';

export interface EmployeeSettings {
  id: string;
  employee_id: string;
  org_id: string;
  created_at: Date;
  updated_at: Date;

  cost_center_ids: number[];
  project_ids: number[];
  per_diem_rate_ids: number[];

  insta_fyle_settings: {
    allowed: boolean;
    enabled: boolean;
    static_camera_overlay_enabled: boolean;
    extract_fields: string[];
  };

  notification_settings: {
    email_allowed: boolean;
    email_enabled: boolean;
    email_unsubscribed_events: string[];
    push_allowed: boolean;
    push_enabled: boolean;
    push_unsubscribed_events: string[];
    notify_user: boolean;
    notify_delegatee: boolean;
  };

  mileage_settings: MileageSettings;

  expense_form_autofills: CommonEmployeeSettings;

  data_extractor_settings: CommonEmployeeSettings;

  in_app_chat_settings: CommonEmployeeSettings & { restore_id: string | null };

  payment_mode_settings: CommonEmployeeSettings & { allowed_payment_modes: AccountType[] };

  locale: Locale;

  is_personal_card_enabled: boolean;
  default_project_id: number | null;
  default_payment_mode: string | null;
  default_vehicle_type: string | null;
}
