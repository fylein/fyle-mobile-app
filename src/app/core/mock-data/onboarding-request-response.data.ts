import deepFreeze from 'deep-freeze-strict';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';

export const onboardingRequestResponse: OnboardingStepStatus = deepFreeze({
  is_configured: false,
  is_skipped: true,
});
