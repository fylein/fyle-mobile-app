import deepFreeze from 'deep-freeze-strict';
import { OnboardingStatus } from '../models/onboarding-status.model';
import { OnboardingState } from '../models/onboarding-state.enum';

export const onboardingStatusData: OnboardingStatus = deepFreeze({
  user_id: 'us1ymEVgUKqb',
  org_id: 'orOTDe765hQp',
  step_connect_cards_is_configured: false,
  step_connect_cards_is_skipped: false,
  step_sms_opt_in_is_configured: false,
  step_sms_opt_in_is_skipped: false,
  step_show_welcome_modal_is_complete: false,
  state: OnboardingState.YET_TO_START,
});
