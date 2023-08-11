import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { DataFeedSource } from 'src/app/core/enums/data-feed-source.enum';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';

@Component({
  selector: 'app-manage-corporate-cards',
  templateUrl: './manage-corporate-cards.page.html',
  styleUrls: ['./manage-corporate-cards.page.scss'],
})
export class ManageCorporateCardsPage {
  corporateCards$: Observable<PlatformCorporateCard[]>;

  isVisaRTFEnabled$: Observable<boolean>;

  isMastercardRTFEnabled$: Observable<boolean>;

  isYodleeEnabled$: Observable<boolean>;

  isLoadingCards: boolean;

  private loadCorporateCards$ = new BehaviorSubject<void>(null);

  constructor(
    private router: Router,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private actionSheetController: ActionSheetController,
    private orgSettingsService: OrgSettingsService,
    private orgUserSettingsService: OrgUserSettingsService,
    private popoverController: PopoverController
  ) {}

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  ionViewWillEnter(): void {
    this.isLoadingCards = true;

    this.corporateCards$ = this.loadCorporateCards$.pipe(
      switchMap(() => this.corporateCreditCardExpenseService.getCorporateCards()),
      tap(() => {
        this.isLoadingCards = false;
      })
    );

    const orgSettings$ = this.orgSettingsService.get();
    const orgUserSettings$ = this.orgUserSettingsService.get();

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

  prepareActionSheetButtons(card: PlatformCorporateCard): Observable<ActionSheetButton[]> {
    return forkJoin([this.isVisaRTFEnabled$, this.isMastercardRTFEnabled$]).pipe(
      map(([isVisaRTFEnabled, isMastercardRTFEnabled]) => {
        const actionSheetButtons: ActionSheetButton[] = [];

        if (card.is_visa_enrolled || card.is_mastercard_enrolled) {
          actionSheetButtons.push({
            text: 'Disconnect',
            handler() {
              // TODO: Disconnect
            },
          });

          if (card.is_dummy) {
            actionSheetButtons.push({
              text: 'Create Dummy Transaction',
              handler() {
                // TODO: Create Dummy Transaction
              },
            });
          }
        } else if (card.data_feed_source === DataFeedSource.STATEMENT_UPLOAD) {
          if (isVisaRTFEnabled) {
            actionSheetButtons.push({
              text: 'Connect to Visa Real-time Feed',
              handler() {
                // TODO: Connect to Visa Real-time Feed
              },
            });
          }

          if (isMastercardRTFEnabled) {
            actionSheetButtons.push({
              text: 'Connect to Mastercard Real-time Feed',
              handler() {
                // TODO: Connect to Mastercard Real-time Feed
              },
            });
          }
        }

        return actionSheetButtons;
      })
    );
  }

  openCardOptions(card: PlatformCorporateCard): void {
    this.prepareActionSheetButtons(card).subscribe(async (actionSheetButtons) => {
      const actionSheet = await this.actionSheetController.create({
        buttons: actionSheetButtons,
        cssClass: 'fy-action-sheet',
        mode: 'md',
      });

      await actionSheet.present();
    });
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

        const { data }: OverlayResponse<{ success: boolean }> = await addCorporateCardPopover.onDidDismiss();
        if (data.success) {
          this.isLoadingCards = true;
          this.loadCorporateCards$.next();
        }
      }
    );
  }
}
