export interface User {
  id?: string;
  created_at?: Date;
  full_name: string;
  email: string;
  email_verified_at?: Date;
  onboarded?: boolean;
  password?: string;
}
