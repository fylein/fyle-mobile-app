export interface User {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  full_name: string;
  email: string;
  email_verified_at?: Date;
  onboarded?: boolean;
  password?: string;
  signup_params?: any;
  password_changed_at?: Date;
  email_verified?: boolean;
}
