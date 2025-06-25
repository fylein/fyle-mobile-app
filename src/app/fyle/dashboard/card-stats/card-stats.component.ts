import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { DashboardService } from '../dashboard.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { BehaviorSubject, Observable, concat, filter, forkJoin, map, shareReplay, switchMap } from 'rxjs';
import { getCurrencySymbol } from '@angular/common';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { PopoverController } from '@ionic/angular';
import { AddCorporateCardComponent } from '../../manage-corporate-cards/add-corporate-card/add-corporate-card.component';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { CardAddedComponent } from '../../manage-corporate-cards/card-added/card-added.component';
import { NetworkService } from 'src/app/core/services/network.service';
import { VirtualCardsService } from 'src/app/core/services/virtual-cards.service';
import { CardStatus } from 'src/app/core/enums/card-status.enum';

@Component({
  selector: 'app-card-stats',
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss'],
})
export class CardStatsComponent implements OnInit {
  @Output() cardAdded = new EventEmitter<void>();

  cardDetails$: Observable<PlatformCorporateCardDetail[]>;

  virtualCardDetails$: Observable<PlatformCorporateCardDetail[]>;

  homeCurrency$: Observable<string>;

  currencySymbol$: Observable<string>;

  isCCCEnabled$: Observable<boolean>;

  isVirtualCardsEnabled$: Observable<{ enabled: boolean }>;

  isVisaRTFEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  canAddCorporateCards$: Observable<boolean>;

  isConnected$: Observable<boolean>;

  loadCardDetails$ = new BehaviorSubject<void>(null);

  CardStatus: typeof CardStatus = CardStatus;

  constructor(
    private currencyService: CurrencyService,
    private dashboardService: DashboardService,
    private orgSettingsService: OrgSettingsService,
    private networkService: NetworkService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private popoverController: PopoverController,
    private virtualCardsService: VirtualCardsService
  ) {}

  ngOnInit(): void {
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  filterVirtualCardsByStateAndAmount(cardDetails: PlatformCorporateCardDetail[]): PlatformCorporateCardDetail[] {
    return cardDetails.filter((cardDetail) => {
      const virtualCardVisibility =
        cardDetail.stats.totalTxnsCount > 0 ||
        cardDetail.card.virtual_card_state === CardStatus.ACTIVE ||
        cardDetail.card.virtual_card_state === CardStatus.PREACTIVE;
      return cardDetail.card.virtual_card_id ? virtualCardVisibility : true;
    });
  }

  getVirtualCardDetails(): Observable<PlatformCorporateCardDetail[]> {
    return this.isVirtualCardsEnabled$.pipe(
      filter((virtualCardEnabled) => virtualCardEnabled.enabled),
      switchMap(() => this.cardDetails$),
      switchMap((cardDetails) => {
        const virtualCardIds = cardDetails
          .filter((cardDetail) => cardDetail.card.virtual_card_id)
          .map((cardDetail) => cardDetail.card.virtual_card_id);
        const virtualCardsParams = {
          virtualCardIds,
          includeCurrentAmount: true,
        };
        return this.virtualCardsService
          .getCardDetailsMap(virtualCardsParams)
          .pipe(map((virtualCardsMap) => ({ virtualCardsMap, cardDetails })));
      }),
      map(({ virtualCardsMap, cardDetails }) => {
        cardDetails.forEach((cardDetail) => {
          cardDetail.virtualCardDetail = virtualCardsMap[cardDetail.card.virtual_card_id];
        });
        cardDetails = this.filterVirtualCardsByStateAndAmount(cardDetails);
        return cardDetails;
      })
    );
  }

  init(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency();

    this.currencySymbol$ = this.homeCurrency$.pipe(map((homeCurrency) => getCurrencySymbol(homeCurrency, 'wide')));

    const orgSettings$ = this.orgSettingsService.get();

    this.isCCCEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled
      )
    );

    this.isVisaRTFEnabled$ = orgSettings$.pipe(
      map((orgSettings) => orgSettings.visa_enrollment_settings.allowed && orgSettings.visa_enrollment_settings.enabled)
    );

    this.isMastercardRTFEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.mastercard_enrollment_settings.allowed && orgSettings.mastercard_enrollment_settings.enabled
      )
    );

    this.isYodleeEnabled$ = orgSettings$.pipe(
      map(
        (orgSettings) =>
          orgSettings.bank_data_aggregation_settings.allowed && orgSettings.bank_data_aggregation_settings.enabled
      )
    );

    this.canAddCorporateCards$ = forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$]).pipe(
      map(([isVisaRTFEnabled, isMastercardRTFEnabled]) => isVisaRTFEnabled || isMastercardRTFEnabled)
    );
    this.isVirtualCardsEnabled$ = orgSettings$.pipe(
      map((orgSettings) => ({
        enabled:
          orgSettings.amex_feed_enrollment_settings.allowed &&
          orgSettings.amex_feed_enrollment_settings.enabled &&
          orgSettings.amex_feed_enrollment_settings.virtual_card_settings_enabled,
      }))
    );

    this.cardDetails$ = this.loadCardDetails$.pipe(
      switchMap(() =>
        forkJoin([this.corporateCreditCardExpenseService.getCorporateCards(), this.dashboardService.getCCCDetails()])
      ),
      map(([corporateCards, corporateCardStats]) =>
        this.corporateCreditCardExpenseService.getPlatformCorporateCardDetails(corporateCards, corporateCardStats)
      )
    );

    this.virtualCardDetails$ = this.getVirtualCardDetails();
  }

  openAddCorporateCardPopover(): void {
    forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$, this.isYodleeEnabled$]).subscribe(
      async ([isVisaRTFEnabled, isMastercardRTFEnabled, isYodleeEnabled]) => {
        const addCorporateCardPopover = await this.popoverController.create({
          component: AddCorporateCardComponent,
          cssClass: 'fy-dialog-popover',
          componentProps: {
            isVisaRTFEnabled,
            isMastercardRTFEnabled,
            isYodleeEnabled,
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

      this.cardAdded.emit();

      this.loadCardDetails$.next();
    });
  }
}
