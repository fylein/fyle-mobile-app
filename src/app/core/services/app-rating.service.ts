import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap, take, catchError } from 'rxjs';
import { PopoverController } from '@ionic/angular/standalone';
import { AppReview } from '@capawesome/capacitor-app-review';
import { LaunchDarklyService } from './launch-darkly.service';
import { AuthService } from './auth.service';
import { NetworkService } from './network.service';
import { OrgUserService } from './org-user.service';
import { FeatureConfigService } from './platform/v1/spender/feature-config.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { TrackingService } from './tracking.service';
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

  private readonly FEATURE_KEY = 'IN_APP_RATING';

  private readonly CONFIG_KEY = 'PROMPT_HISTORY';

  private readonly MIN_DAYS_ON_PLATFORM = 30;

  private readonly MIN_EXPENSE_COUNT = 10;

  private readonly NATIVE_PROMPT_COOLDOWN_DAYS = 180;

  private readonly DISMISSAL_COOLDOWN_DAYS = 60;

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

  showRatingPrompt(): void {
    this.trackingService.eventTrack('In App Rating Eligible', {});
    this.showPrePromptPopover();
  }

  checkEligibility(): Observable<boolean> {
    // TODO: Uncomment all eligibility checks before production release.
    // All checks are commented out for testing — this always returns true.
    return of(true);

    // return this.launchDarklyService.getVariation('in_app_rating', false).pipe(
    //   switchMap((flagEnabled) => {
    //     if (!flagEnabled) {
    //       return of(false);
    //     }
    //
    //     return forkJoin({
    //       eou: from(this.authService.getEou()),
    //       isConnected: this.networkService.isOnline().pipe(take(1)),
    //       isDelegator: from(this.orgUserService.isSwitchedToDelegator()),
    //     }).pipe(
    //       switchMap(({ eou, isConnected, isDelegator }) => {
    //         if (!isConnected) {
    //           return of(false);
    //         }
    //         if (!eou?.ou?.org_name) {
    //           return of(false);
    //         }
    //         if (eou.ou.org_name.toLowerCase().includes('fyle for')) {
    //           return of(false);
    //         }
    //         if (isDelegator) {
    //           return of(false);
    //         }
    //         if (!this.isUserOldEnough(eou)) {
    //           return of(false);
    //         }
    //
    //         return this.getPromptHistory().pipe(
    //           switchMap((history) => {
    //             if (!this.isNativePromptCooldownMet(history)) {
    //               return of(false);
    //             }
    //             if (!this.isDismissalCooldownMet(history)) {
    //               return of(false);
    //             }
    //
    //             return this.hasEnoughExpenses();
    //           }),
    //         );
    //       }),
    //     );
    //   }),
    // );
  }

  isUserOldEnough(eou: ExtendedOrgUser): boolean {
    const createdAt = eou?.ou?.created_at;
    if (!createdAt) {
      return false;
    }
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation >= this.MIN_DAYS_ON_PLATFORM;
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
    const popover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: this.translocoService.translate<string>('services.appRating.ratingPromptTitle'),
        message: this.translocoService.translate<string>('services.appRating.ratingPromptMessage'),
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
