import { OnboardingState } from './onboarding-state.enum';

export interface OnboardingStatus {
  user_id: string;
  org_id: string;
  step_connect_cards_is_configured: boolean;
  step_connect_cards_is_skipped: boolean;
  step_sms_opt_in_is_configured: boolean;
  step_sms_opt_in_is_skipped: boolean;
  step_show_welcome_modal_is_complete: boolean;
  state: OnboardingState;
}
