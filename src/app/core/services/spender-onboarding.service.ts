import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { OnboardingWelcomeStepStatus } from '../models/onboarding-welcome-step-status.model';
import { OnboardingStepStatus } from '../models/onboarding-step-status.model';
import { OnboardingStatus } from '../models/onboarding-status.model';

@Injectable({
  providedIn: 'root',
})
export class SpenderOnboardingService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getOnboardingStatus(): Observable<OnboardingStatus> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<OnboardingStatus>>('/onboarding')
      .pipe(map((res) => res.data));
  }

  processConnectCardsStep(data: OnboardingStepStatus): Observable<OnboardingStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingStepStatus>>('/onboarding/process_step_connect_cards', {
        data,
      })
      .pipe(map((res) => res.data));
  }

  processSmsOptInStep(data: OnboardingStepStatus): Observable<OnboardingStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingStepStatus>>('/onboarding/process_step_sms_opt_in', { data })
      .pipe(map((res) => res.data));
  }

  processWelcomeModalStep(data: OnboardingWelcomeStepStatus): Observable<OnboardingWelcomeStepStatus> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<OnboardingWelcomeStepStatus>>('/onboarding/process_step_show_welcome_modal', {
        data,
      })
      .pipe(map((res) => res.data));
  }

  markWelcomeModalStepAsComplete(): Observable<OnboardingWelcomeStepStatus> {
    const data: OnboardingWelcomeStepStatus = {
      is_complete: true,
    };
    return this.processWelcomeModalStep(data);
  }

  markConnectCardsStepAsComplete(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processConnectCardsStep(data);
  }

  skipConnectCardsStep(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processConnectCardsStep(data);
  }

  markSmsOptInStepAsComplete(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processSmsOptInStep(data);
  }

  skipSmsOptInStep(): Observable<OnboardingStepStatus> {
    const data: OnboardingStepStatus = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processSmsOptInStep(data);
  }
}
