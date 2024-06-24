import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, ModalController, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subscription, filter, forkJoin, from, map, noop, switchMap } from 'rxjs';
import { DataFeedSource } from 'src/app/core/enums/data-feed-source.enum';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { CardAddedComponent } from './card-added/card-added.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { RefresherCustomEvent, SegmentCustomEvent } from '@ionic/core';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ManageCardsPageSegment } from 'src/app/core/enums/manage-cards-page-segment.enum';
import { VirtualCardsService } from 'src/app/core/services/virtual-cards.service';
import { CardDetailsCombinedResponse } from 'src/app/core/models/card-details-combined-response.model';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PromoteOptInModalComponent } from 'src/app/shared/components/promote-opt-in-modal/promote-opt-in-modal.component';
import { AuthService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-manage-corporate-cards',
  templateUrl: './manage-corporate-cards.page.html',
  styleUrls: ['./manage-corporate-cards.page.scss'],
})
export class ManageCorporateCardsPage {
  corporateCards$: Observable<PlatformCorporateCard[]>;

  virtualCardDetails$: Observable<{ [id: string]: CardDetailsCombinedResponse }>;

  isVisaRTFEnabled$: Observable<boolean>;

  isVirtualCardsEnabled$: Observable<{ enabled: boolean }>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  loadCorporateCards$ = new BehaviorSubject<void>(null);

  segmentValue = ManageCardsPageSegment.CORPORATE_CARDS;

  optInShowTimer;

  navigationSubscription: Subscription;

  constructor(
    private router: Router,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private actionSheetController: ActionSheetController,
    private popoverController: PopoverController,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private realTimeFeedService: RealTimeFeedService,
    private trackingService: TrackingService,
    private virtualCardsService: VirtualCardsService,
    private utilityService: UtilityService,
    private featureConfigService: FeatureConfigService,
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private authService: AuthService
  ) {}

  get Segment(): typeof ManageCardsPageSegment {
    return ManageCardsPageSegment;
  }

  segmentChanged(event: SegmentCustomEvent): void {
    if (event.detail.value) {
      this.segmentValue = parseInt(event.detail.value, 10);
    }
  }

  areVirtualCardsPresent(corporateCards: PlatformCorporateCard[]): boolean {
    return corporateCards.filter((corporateCard) => corporateCard.virtual_card_id).length > 0;
  }

  refresh(event: RefresherCustomEvent): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(() => {
      this.loadCorporateCards$.next();
      event.target.complete();
    });
  }

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  getVirtualCardDetails(): Observable<{
    [id: string]: CardDetailsCombinedResponse;
  }> {
    return this.isVirtualCardsEnabled$.pipe(
      filter((virtualCardEnabled) => virtualCardEnabled.enabled),
      switchMap(() => this.corporateCards$),
      switchMap((corporateCards) => {
        const virtualCardIds = corporateCards
          .filter((card) => card.virtual_card_id)
          .map((card) => card.virtual_card_id);
        const virtualCardsParams = {
          virtualCardIds,
        };
        return this.virtualCardsService.getCardDetailsMap(virtualCardsParams);
      })
    );
  }

  ionViewWillEnter(): void {
    this.corporateCards$ = this.loadCorporateCards$.pipe(
      switchMap(() => this.corporateCreditCardExpenseService.getCorporateCards())
    );

    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();
    this.isVirtualCardsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => ({
        enabled:
          orgSettings.amex_feed_enrollment_settings.allowed &&
          orgSettings.amex_feed_enrollment_settings.enabled &&
          orgSettings.amex_feed_enrollment_settings.virtual_card_settings_enabled,
      }))
    );

    this.virtualCardDetails$ = this.getVirtualCardDetails();
    this.isVisaRTFEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled)
    );

    this.isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled
      )
    );

    this.isYodleeEnabled$ = forkJoin([orgSettings$, orgUserSettings$]).pipe(
      map(
        ([orgSettings, orgUserSettings]) =>
          orgSettings.bank_data_aggregation_settings.allowed &&
          orgSettings.bank_data_aggregation_settings.enabled &&
          orgUserSettings.bank_data_aggregation_settings.enabled
      )
    );
  }

  ionViewWillLeave(): void {
    clearTimeout(this.optInShowTimer as number);
    this.navigationSubscription?.unsubscribe();
    this.utilityService.toggleShowOptInAfterAddingCard(false);
  }

  getCorporateCardsLength(corporateCards: PlatformCorporateCard[]): number {
    return corporateCards.filter((card) => !card.virtual_card_id).length;
  }

  setActionSheetButtons(card: PlatformCorporateCard): Observable<ActionSheetButton[]> {
    return forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$]).pipe(
      map(([isVisaRTFEnabled, isMastercardRTFEnabled]) => {
        const actionSheetButtons: ActionSheetButton[] = [];

        if (card.is_visa_enrolled || card.is_mastercard_enrolled) {
          actionSheetButtons.push({
            text: 'Disconnect',
            icon: 'assets/svg/bin.svg',
            cssClass: 'danger',
            handler: () => {
              this.unenrollCard(card);
            },
          });
        } else if (card.data_feed_source === DataFeedSource.STATEMENT_UPLOAD) {
          if (isVisaRTFEnabled) {
            actionSheetButtons.push({
              text: 'Connect to Visa Real-time Feed',
              handler: () => {
                this.openAddCorporateCardPopover(card, CardNetworkType.VISA);
              },
            });
          }

          if (isMastercardRTFEnabled) {
            actionSheetButtons.push({
              text: 'Connect to Mastercard Real-time Feed',
              handler: () => {
                this.openAddCorporateCardPopover(card, CardNetworkType.MASTERCARD);
              },
            });
          }
        }

        return actionSheetButtons;
      })
    );
  }

  openCardOptions(card: PlatformCorporateCard): void {
    this.setActionSheetButtons(card).subscribe(async (actionSheetButtons) => {
      const actionSheet = await this.actionSheetController.create({
        buttons: actionSheetButtons,
        cssClass: 'fy-action-sheet',
        mode: 'md',
      });

      await actionSheet.present();
    });
  }

  openAddCorporateCardPopover(card?: PlatformCorporateCard, cardType?: CardNetworkType): void {
    forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$, this.isYodleeEnabled$]).subscribe(
      async ([isVisaRTFEnabled, isMastercardRTFEnabled, isYodleeEnabled]) => {
        const addCorporateCardPopover = await this.popoverController.create({
          component: AddCorporateCardComponent,
          cssClass: 'fy-dialog-popover',
          componentProps: {
            isVisaRTFEnabled,
            isMastercardRTFEnabled,
            isYodleeEnabled,
            card,
            cardType,
          },
        });

        await addCorporateCardPopover.present();
        const popoverResponse = (await addCorporateCardPopover.onDidDismiss()) as OverlayResponse<{ success: boolean }>;

        if (popoverResponse.data?.success) {
          this.handleEnrollmentSuccess();
        }
      }
    );
  }

  async showPromoteOptInModal(): Promise<void> {
    this.trackingService.showOptInModalPostCardAdditionInSettings();

    from(this.authService.getEou()).subscribe(async (eou) => {
      const optInPromotionalModal = await this.modalController.create({
        component: PromoteOptInModalComponent,
        componentProps: {
          extendedOrgUser: eou,
        },
        mode: 'ios',
        ...this.modalProperties.getModalDefaultProperties('promote-opt-in-modal'),
      });

      await optInPromotionalModal.present();

      const optInModalFeatureConfig = {
        feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      };

      this.featureConfigService.saveConfiguration(optInModalFeatureConfig).subscribe(noop);

      const { data } = await optInPromotionalModal.onDidDismiss<{ skipOptIn: boolean }>();

      if (data?.skipOptIn) {
        this.trackingService.skipOptInModalPostCardAdditionInSettings();
      } else {
        this.trackingService.optInFromPostPostCardAdditionInSettings();
      }
    });
  }

  setModalDelay(): void {
    this.optInShowTimer = setTimeout(() => {
      this.showPromoteOptInModal();
    }, 2000);
  }

  setNavigationSubscription(): void {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.optInShowTimer as number);

        const optInModalFeatureConfig = {
          feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
          key: 'OPT_IN_POPUP_SHOWN_COUNT',
        };

        this.utilityService.canShowOptInModal(optInModalFeatureConfig).subscribe((canShowOptInModal) => {
          if (canShowOptInModal) {
            this.showPromoteOptInModal();
          }
        });
      }
    });
  }

  onCardAdded(): void {
    const optInModalFeatureConfig = {
      feature: 'OPT_IN_POPUP_POST_CARD_ADDITION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    };

    this.utilityService.canShowOptInModal(optInModalFeatureConfig).subscribe((canShowOptInModal) => {
      if (canShowOptInModal) {
        this.setModalDelay();
        this.setNavigationSubscription();
        this.utilityService.toggleShowOptInAfterAddingCard(true);
      }
    });
  }

  private handleEnrollmentSuccess(): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(async () => {
      const cardAddedModal = await this.popoverController.create({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });

      await cardAddedModal.present();
      await cardAddedModal.onDidDismiss();

      this.onCardAdded();

      this.loadCorporateCards$.next();
    });
  }

  private async unenrollCard(card: PlatformCorporateCard): Promise<void> {
    const cardType = this.realTimeFeedService.getCardType(card);

    const deletePopup = await this.popoverController.create({
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
      componentProps: {
        title: 'Disconnect Card',
        message: `<div class="text-left"><div class="mb-16">You are disconnecting your ${cardType} card from real-time feed.</div><div>Do you wish to continue?</div></div>`,
        primaryCta: {
          text: 'Yes, Disconnect',
          action: 'disconnect',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
    });

    await deletePopup.present();

    const popoverResponse = (await deletePopup.onDidDismiss()) as OverlayResponse<{ action: string }>;

    if (popoverResponse.data?.action === 'disconnect') {
      forkJoin([
        this.realTimeFeedService.unenroll(card),
        this.corporateCreditCardExpenseService.clearCache(),
      ]).subscribe(() => {
        this.loadCorporateCards$.next();
        this.trackingService.cardUnenrolled({
          'Card Network': cardType,
          'Card ID': card.id,
        });
      });
    }
  }
}
