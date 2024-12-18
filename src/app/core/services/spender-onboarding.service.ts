import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { UpdateOnboardingStatusParams } from '../models/update-onboarding-status-params.model';
import { UpdateOnboardingStatusResponse } from '../models/update-onboarding-status-response.model';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getOnboardingStatus(): Observable<UpdateOnboardingStatusParams> {
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<UpdateOnboardingStatusResponse>>('/spender/onboarding')
      .pipe(map((res) => res.data));
  }

  processConnectCardsStep(data: UpdateOnboardingStatusResponse): Observable<UpdateOnboardingStatusParams> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<UpdateOnboardingStatusParams>>('/spender/onboarding/process_step_connect_cards', {
        data,
      })
      .pipe(map((res) => res.data));
  }

  processSmsOptInStep(data: UpdateOnboardingStatusParams): Observable<UpdateOnboardingStatusParams> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<UpdateOnboardingStatusParams>>('/spender/onboarding/process_step_sms_opt_in', { data })
      .pipe(map((res) => res.data));
  }

  processWelcomeModalStep(data: OnboardingWelcomeStepStatus): Observable<UpdateOnboardingStatusResponse> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiResponse<UpdateOnboardingStatusResponse>>(
        '/spender/onboarding/process_step_show_welcome_modal',
        { data }
      )
      .pipe(map((res) => res.data));
  }

  markWelcomeModalStepAsComplete(): Observable<UpdateOnboardingStatusResponse> {
    const data: OnboardingWelcomeStepStatus = {
      is_complete: true,
    };
    return this.processWelcomeModalStep(data);
  }

  markConnectCardsStepAsComplete(): Observable<UpdateOnboardingStatusParams> {
    const data: UpdateOnboardingStatusParams = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processConnectCardsStep(data);
  }

  skipConnectCardsStep(): Observable<UpdateOnboardingStatusParams> {
    const data: UpdateOnboardingStatusResponse = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processConnectCardsStep(data);
  }

  markSmsOptInStepAsComplete(): Observable<UpdateOnboardingStatusParams> {
    const data: UpdateOnboardingStatusResponse = {
      is_configured: true,
      is_skipped: false,
    };
    return this.processSmsOptInStep(data);
  }

  skipSmsOptInStep(): Observable<UpdateOnboardingStatusParams> {
    const data: UpdateOnboardingStatusResponse = {
      is_configured: false,
      is_skipped: true,
    };
    return this.processSmsOptInStep(data);
  }
}
