import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, concatMap, forkJoin, map, of, switchMap } from 'rxjs';
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

@Component({
  selector: 'app-manage-corporate-cards',
  templateUrl: './manage-corporate-cards.page.html',
  styleUrls: ['./manage-corporate-cards.page.scss'],
})
export class ManageCorporateCardsPage {
  corporateCards$: Observable<PlatformCorporateCard[]>;

  virtualCardDetails$: Observable<any>;

  isVisaRTFEnabled$: Observable<boolean>;

  isVirtualCardsEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  loadCorporateCards$ = new BehaviorSubject<void>(null);

  segmentValue = ManageCardsPageSegment.CORPORATE_CARDS;

  virtualCardMap = {};

  constructor(
    private router: Router,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private actionSheetController: ActionSheetController,
    private popoverController: PopoverController,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private realTimeFeedService: RealTimeFeedService,
    private trackingService: TrackingService,
    private virtualCardsService: VirtualCardsService
  ) {}

  get Segment(): typeof ManageCardsPageSegment {
    return ManageCardsPageSegment;
  }

  segmentChanged(event: SegmentCustomEvent): void {
    if (event?.detail?.value) {
      this.segmentValue = parseInt(event.detail.value, 10);
    }
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

  ionViewWillEnter(): void {
    this.corporateCards$ = this.loadCorporateCards$.pipe(
      switchMap(() => this.corporateCreditCardExpenseService.getCorporateCards())
    );

    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();
    this.isVirtualCardsEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.amex_feed_enrollment_settings.allowed &&
          orgSettings.amex_feed_enrollment_settings.enabled &&
          orgSettings.amex_feed_enrollment_settings.virtual_card_settings_enabled
      )
    );
    this.isVirtualCardsEnabled$.subscribe((isVirtualCardsEnabled) => {
      if (isVirtualCardsEnabled) {
        this.virtualCardDetails$ = this.corporateCards$.pipe(
          switchMap((corporateCards) => {
            const virtualCards = corporateCards.filter((card) => card.virtual_card_id);
            const virtualCardIds = virtualCards.map((card) => card.virtual_card_id);
            return this.virtualCardsService.getCardDetailsInBatches(virtualCardIds);
          })
        );
      }
    });
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

  getCorporateCardsLength(corporateCards): number {
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

  private handleEnrollmentSuccess(): void {
    this.corporateCreditCardExpenseService.clearCache().subscribe(async () => {
      const cardAddedModal = await this.popoverController.create({
        component: CardAddedComponent,
        cssClass: 'pop-up-in-center',
      });

      await cardAddedModal.present();
      await cardAddedModal.onDidDismiss();

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
          'Card Number': card.card_number,
        });
      });
    }
  }
}
