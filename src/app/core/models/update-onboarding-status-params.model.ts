export interface UpdateOnboardingStatusParams {
  user_id: string;
  org_id: string;
  is_configured: boolean; // true if step was completed, else false
  is_skipped: boolean; // true if step was skipped, else false
}
