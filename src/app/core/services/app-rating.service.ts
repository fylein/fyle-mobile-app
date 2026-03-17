import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, from, map, of, switchMap, take, catchError } from 'rxjs';
import { PopoverController } from '@ionic/angular/standalone';
import { AppReview } from '@capawesome/capacitor-app-review';
import { LaunchDarklyService } from './launch-darkly.service';
import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';
import { FeatureConfigService } from './platform/v1/spender/feature-config.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { TrackingService } from './tracking.service';
import { AppVersionService } from './app-version.service';
import { DeviceService } from './device.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AppRatingHistory } from '../models/app-rating-history.model';
import { FeatureConfig } from '../models/feature-config.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class AppRatingService {
  private launchDarklyService = inject(LaunchDarklyService);

  private authService = inject(AuthService);

  private networkService = inject(NetworkService);

  private orgUserService = inject(OrgUserService);

  private featureConfigService = inject(FeatureConfigService);

  private expensesService = inject(ExpensesService);

  private popoverController = inject(PopoverController);

  private trackingService = inject(TrackingService);

  private translocoService = inject(TranslocoService);

  private appVersionService = inject(AppVersionService);

  private deviceService = inject(DeviceService);

  private readonly FEATURE_KEY = 'IN_APP_RATING';

  private readonly CONFIG_KEY = 'PROMPT_HISTORY';

  private readonly MIN_DAYS_ON_PLATFORM = 30;

  private readonly MIN_DAYS_ON_MOBILE = 30;

  private readonly MIN_EXPENSE_COUNT = 10;

  private readonly NATIVE_PROMPT_COOLDOWN_DAYS = 180;

  private readonly DISMISSAL_COOLDOWN_DAYS = 60;

  private readonly POST_SAVE_DELAY_MS = 1000;

  attemptRatingPrompt(): void {
    this.checkEligibility()
      .pipe(
        take(1),
        catchError(() => of(false)),
      )
      .subscribe((eligible) => {
        if (eligible) {
          this.trackingService.eventTrack('In App Rating Eligible', {});
          this.showPrePromptPopover();
        }
      });
  }

  notifySaveSuccess(): void {
    setTimeout(() => {
      this.attemptRatingPrompt();
    }, this.POST_SAVE_DELAY_MS);
  }

  checkEligibility(): Observable<boolean> {
    return this.launchDarklyService
      .getVariation('in_app_rating', false)
      .pipe(switchMap((flagEnabled) => (flagEnabled ? this.runEligibilityChecks() : of(false))));
  }

  private runEligibilityChecks(): Observable<boolean> {
    return forkJoin({
      eou: from(this.authService.getEou()),
      isConnected: this.networkService.isOnline().pipe(take(1)),
      isDelegator: from(this.orgUserService.isSwitchedToDelegator()),
      isOldEnoughOnMobile: this.isUserOldEnoughOnMobile(),
      promptHistory: this.getPromptHistory(),
      hasEnoughExpenses: this.hasEnoughExpenses(),
    }).pipe(map((data) => this.evaluateEligibility(data)));
  }

  private evaluateEligibility(data: {
    eou: ExtendedOrgUser;
    isConnected: boolean;
    isDelegator: boolean;
    isOldEnoughOnMobile: boolean;
    promptHistory: AppRatingHistory;
    hasEnoughExpenses: boolean;
  }): boolean {
    if (!this.isBasicCriteriaMet(data)) {
      return false;
    }

    if (!this.isOrgValid(data.eou)) {
      return false;
    }

    if (!this.isUserOldEnough(data.eou)) {
      return false;
    }

    return this.isNativePromptCooldownMet(data.promptHistory) && this.isDismissalCooldownMet(data.promptHistory);
  }

  private isBasicCriteriaMet(data: {
    isConnected: boolean;
    isDelegator: boolean;
    isOldEnoughOnMobile: boolean;
    hasEnoughExpenses: boolean;
  }): boolean {
    return data.isConnected && !data.isDelegator && data.isOldEnoughOnMobile && data.hasEnoughExpenses;
  }

  private isOrgValid(eou: ExtendedOrgUser): boolean {
    return !!eou?.ou?.org_name && !eou.ou.org_name.toLowerCase().includes('fyle for');
  }

  isUserOldEnough(eou: ExtendedOrgUser): boolean {
    const createdAt = eou?.ou?.created_at;
    if (!createdAt) {
      return false;
    }
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation >= this.MIN_DAYS_ON_PLATFORM;
  }

  isUserOldEnoughOnMobile(): Observable<boolean> {
    return this.deviceService.getDeviceInfo().pipe(
      switchMap((deviceInfo) => this.appVersionService.getFirstMobileLoginDate(deviceInfo.operatingSystem)),
      map((firstLoginDate) => {
        if (!firstLoginDate) {
          return false;
        }
        const daysSinceFirstLogin = (Date.now() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceFirstLogin >= this.MIN_DAYS_ON_MOBILE;
      }),
    );
  }

  hasEnoughExpenses(): Observable<boolean> {
    return this.expensesService
      .getExpenseStats({
        state: 'in.(COMPLETE,APPROVER_PENDING,APPROVED,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      })
      .pipe(map((stats) => (stats?.data?.count || 0) >= this.MIN_EXPENSE_COUNT));
  }

  getPromptHistory(): Observable<AppRatingHistory> {
    const defaultHistory: AppRatingHistory = { nativePrompts: [], dismissals: [] };
    return this.featureConfigService
      .getConfiguration<AppRatingHistory>({
        feature: this.FEATURE_KEY,
        key: this.CONFIG_KEY,
        is_shared: false,
      })
      .pipe(map((config: FeatureConfig<AppRatingHistory>) => config?.value || defaultHistory));
  }

  isNativePromptCooldownMet(history: AppRatingHistory): boolean {
    if (!history?.nativePrompts?.length) {
      return true;
    }
    const lastNativePrompt = new Date(history.nativePrompts[history.nativePrompts.length - 1]);
    const daysSince = (Date.now() - lastNativePrompt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= this.NATIVE_PROMPT_COOLDOWN_DAYS;
  }

  isDismissalCooldownMet(history: AppRatingHistory): boolean {
    if (!history?.dismissals?.length) {
      return true;
    }
    const lastDismissal = new Date(history.dismissals[history.dismissals.length - 1]);
    const daysSince = (Date.now() - lastDismissal.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= this.DISMISSAL_COOLDOWN_DAYS;
  }

  private async showPrePromptPopover(): Promise<void> {
    const existingPopover = await this.popoverController.getTop();
    if (existingPopover) {
      await existingPopover.dismiss();
    }

    const popover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: this.translocoService.translate<string>('services.appRating.ratingPromptTitle'),
        message: this.translocoService.translate<string>('services.appRating.ratingPromptMessage'),
        icon: 'thumbsup-outline',
        primaryCta: {
          text: this.translocoService.translate<string>('services.appRating.leaveARating'),
          action: 'rate',
        },
        secondaryCta: {
          text: this.translocoService.translate<string>('services.appRating.notNow'),
          action: 'dismiss',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await popover.present();
    this.trackingService.eventTrack('In App Rating Pre Prompt Shown', {});

    const { data } = await popover.onWillDismiss<{ action: string }>();

    if (data?.action === 'rate') {
      this.trackingService.eventTrack('In App Rating Accepted', {});
      await this.triggerNativeReview();
      this.recordInteraction('nativePrompts');
    } else {
      this.trackingService.eventTrack('In App Rating Dismissed', {});
      this.recordInteraction('dismissals');
    }
  }

  private async triggerNativeReview(): Promise<void> {
    try {
      await AppReview.requestReview();
      this.trackingService.eventTrack('In App Rating Native Triggered', {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.trackingService.eventTrack('In App Rating Native Triggered Failed', { error: message });
    }
  }

  private recordInteraction(type: 'nativePrompts' | 'dismissals'): void {
    this.getPromptHistory()
      .pipe(
        take(1),
        switchMap((history) => {
          const updatedHistory: AppRatingHistory = {
            nativePrompts: [...(history?.nativePrompts || [])],
            dismissals: [...(history?.dismissals || [])],
          };
          updatedHistory[type].push(new Date().toISOString());

          return this.featureConfigService.saveConfiguration<AppRatingHistory>({
            feature: this.FEATURE_KEY,
            key: this.CONFIG_KEY,
            value: updatedHistory,
            is_shared: false,
          });
        }),
        catchError(() => of(null)),
      )
      .subscribe();
  }
}
