import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverController, IonicModule } from '@ionic/angular';
import { catchError, concatMap, finalize, from, map, of } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { CardProperties } from '../models/card-properties.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { NgClass } from '@angular/common';
import { NgxMaskModule } from 'ngx-mask';
import { FormButtonValidationDirective } from '../../../shared/directive/form-button-validation.directive';

@Component({
    selector: 'app-spender-onboarding-connect-card-step',
    templateUrl: './spender-onboarding-connect-card-step.component.html',
    styleUrls: ['./spender-onboarding-connect-card-step.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        NgxMaskModule,
        IonicModule,
        FormButtonValidationDirective,
        TranslocoPipe,
    ],
})
export class SpenderOnboardingConnectCardStepComponent implements OnInit, OnChanges {
  private corporateCreditCardExpensesService = inject(CorporateCreditCardExpenseService);

  private realTimeFeedService = inject(RealTimeFeedService);

  private fb = inject(UntypedFormBuilder);

  private popoverController = inject(PopoverController);

  private trackingService = inject(TrackingService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() orgSettings: OrgSettings;

  readonly isStepComplete = output<boolean>();

  readonly isStepSkipped = output<boolean>();

  cardForm: UntypedFormControl;

  isVisaRTFEnabled = false;

  isMastercardRTFEnabled = false;

  enrollableCards: PlatformCorporateCard[] = [];

  cardValuesMap: Record<string, CardProperties> = {};

  cardsLoading = true;

  singleEnrollableCardType: CardNetworkType;

  cardsList: PopoverCardsList = {
    successfulCards: [],
    failedCards: [],
  };

  fg: UntypedFormGroup;

  cardsEnrolling = false;

  singularEnrollmentFailure: string;

  setupErrorMessages(error: HttpErrorResponse, cardNumber: string, cardId?: string): void {
    this.cardsList.failedCards.push(`**** ${cardNumber}`);
    this.handleEnrollmentFailures(error, cardId);
  }

  getFullCardNumber(cardId: string): string {
    return this.fg.controls[`card_number_${cardId}`]?.value + this.cardValuesMap[cardId].last_four;
  }

  enrollMultipleCards(cards: PlatformCorporateCard[]): void {
    from(cards)
      .pipe(
        concatMap((card) =>
          this.realTimeFeedService.enroll(this.getFullCardNumber(card.id), card.id).pipe(
            map(() => {
              this.cardsList.successfulCards.push(`**** ${card.card_number.slice(-4)}`);
              this.cardValuesMap[card.id].enrollment_success = true;
            }),
            catchError((error: HttpErrorResponse) => {
              this.trackingService.eventTrack('Connect Cards Onboarding Step - Failed', {
                CardNumber: card.card_number.slice(-4),
                error,
              });
              this.setupErrorMessages(error, `${card.card_number.slice(-4)}`, card.id);
              return of(error);
            }),
          ),
        ),
        finalize(() => {
          this.handleEnrollmentCompletion();
        }),
      )
      .subscribe();
  }

  enrollSingularCard(): void {
    this.realTimeFeedService
      .enroll(this.fg.controls.card_number.value as string)
      .pipe(
        map(() => {
          this.cardsList.successfulCards.push(`**** ${(this.fg.controls.card_number.value as string).slice(-4)}`);
        }),
        catchError((error: HttpErrorResponse) => {
          this.trackingService.eventTrack('Connect Cards Onboarding Step - Failed', {
            CardNumber: (this.fg.controls.card_number.value as string).slice(-4),
            error,
          });
          this.setupErrorMessages(error, (this.fg.controls.card_number.value as string).slice(-4));
          return of(error);
        }),
        finalize(() => {
          this.handleEnrollmentCompletion();
        }),
      )
      .subscribe();
  }

  enrollCards(): void {
    this.cardsList = {
      successfulCards: [],
      failedCards: [],
    };
    this.fg.markAllAsTouched();
    if (!this.fg.valid) {
      return;
    }
    const cards = this.enrollableCards.filter((card) => !this.cardValuesMap[card.id]?.enrollment_success);
    this.cardsEnrolling = true;
    if (cards.length > 0) {
      this.enrollMultipleCards(cards);
    } else {
      this.enrollSingularCard();
    }
  }

  generateMessage(): string {
    if (this.cardsList.successfulCards.length > 0) {
      return this.translocoService.translate('spenderOnboardingConnectCardStep.partialEnrollmentError');
    } else if (this.cardsList.failedCards.length > 1) {
      const allButLast = this.cardsList.failedCards.slice(0, -1).join(', ');
      const lastCard = this.cardsList.failedCards[this.cardsList.failedCards.length - 1];
      return this.translocoService.translate('spenderOnboardingConnectCardStep.multipleEnrollmentError', {
        allButLast,
        lastCard,
      });
    } else {
      const failedCard = this.cardsList.failedCards[0];
      return this.translocoService.translate('spenderOnboardingConnectCardStep.singleEnrollmentError', { failedCard });
    }
  }

  async showErrorPopover(): Promise<void> {
    const title =
      this.cardsList.successfulCards.length > 0
        ? this.translocoService.translate('spenderOnboardingConnectCardStep.statusSummaryTitle')
        : this.translocoService.translate('spenderOnboardingConnectCardStep.failedConnectingTitle');
    const message = this.generateMessage();
    const primaryCta =
      this.cardsList.successfulCards.length > 0
        ? this.translocoService.translate('spenderOnboardingConnectCardStep.continue')
        : this.translocoService.translate('spenderOnboardingConnectCardStep.proceedAnyway');
    const secondaryCta =
      this.cardsList.successfulCards.length > 0
        ? null
        : {
            text: this.translocoService.translate('spenderOnboardingConnectCardStep.cancel'),
            action: 'cancel',
          };
    const cardsList = this.cardsList.successfulCards.length > 0 ? this.cardsList : {};

    const errorPopover = await this.popoverController.create({
      componentProps: {
        title,
        message,
        leftAlign: true,
        primaryCta: {
          text: primaryCta,
          action: 'close',
        },
        secondaryCta,
        cardsList,
      },
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
    });

    await errorPopover.present();

    const { data } = (await errorPopover.onWillDismiss()) as OverlayResponse<{
      action: string;
    }>;

    if (this.cardsList.successfulCards.length > 0) {
      this.trackingService.eventTrack('Connect Cards Onboarding Step - Completed', {
        numberOfCards: this.cardsList.successfulCards.length,
      });
      this.isStepComplete.emit(true);
    } else if (data?.action === 'close') {
      this.isStepSkipped.emit(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgSettings.currentValue) {
      this.isVisaRTFEnabled = this.orgSettings.visa_enrollment_settings.enabled;
      this.isMastercardRTFEnabled = this.orgSettings.mastercard_enrollment_settings.enabled;
    }
  }

  setupForm(): void {
    this.cardsLoading = true;
    this.corporateCreditCardExpensesService
      .getCorporateCards()
      .pipe(
        map((corporateCards) => {
          this.enrollableCards = corporateCards.filter((card) => card.data_feed_source === 'STATEMENT_UPLOAD');

          if (this.enrollableCards.length > 0) {
            this.enrollableCards.forEach((card) => {
              const controlName = `card_number_${card.id}`;
              this.cardValuesMap[card.id] = {
                last_four: card.card_number.slice(-4),
                card_type: CardNetworkType.OTHERS,
              };
              this.fg.addControl(
                controlName,
                new UntypedFormControl('', [
                  Validators.required,
                  Validators.maxLength(12),
                  this.cardNumberValidator(card.id),
                  this.cardNetworkValidator(card.id),
                ]),
              );
            });
          } else {
            this.singleEnrollableCardType = CardNetworkType.OTHERS;
            this.fg.addControl(
              'card_number',
              new UntypedFormControl('', [
                Validators.required,
                Validators.maxLength(16),
                this.cardNumberValidator(),
                this.cardNetworkValidator(),
              ]),
            );
          }
          this.cardsLoading = false;
        }),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.fg = this.fb.group({});
    this.trackingService.eventTrack('Connect Cards Onboarding Step - Viewed');
    this.setupForm();
  }

  onCardNumberUpdate(card?: PlatformCorporateCard): void {
    if (this.enrollableCards.length > 0) {
      this.cardValuesMap[card.id].card_type = this.realTimeFeedService.getCardTypeFromNumber(
        this.fg.controls[`card_number_${card.id}`].value as string,
      );
    } else {
      this.singleEnrollableCardType = this.realTimeFeedService.getCardTypeFromNumber(
        this.fg.controls.card_number.value as string,
      );
    }
  }

  private handleEnrollmentFailures(error: Error, cardId?: string): void {
    const enrollmentFailureMessage =
      error.message || this.translocoService.translate('spenderOnboardingConnectCardStep.genericEnrollmentError');
    if (this.enrollableCards.length > 0) {
      this.fg.controls[`card_number_${cardId}`].setErrors({ enrollmentError: true });
      this.cardValuesMap[cardId].enrollment_error = enrollmentFailureMessage;
    } else {
      this.fg.controls.card_number.setErrors({ enrollmentError: true });
      this.singularEnrollmentFailure = enrollmentFailureMessage;
    }
  }

  private cardNumberValidator(cardId?: string): ValidatorFn {
    return (): ValidationErrors | null => {
      // Reactive forms are not strongly typed in Angular 13, so we need to cast the value to string
      // TODO (Angular 14 >): Remove the type casting and directly use string type for the form control
      if (Object.keys(this.fg.controls).length > 0) {
        const cardNumber = cardId ? this.getFullCardNumber(cardId) : (this.fg.controls.card_number.value as string);

        const isValid = this.realTimeFeedService.isCardNumberValid(cardNumber);
        const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

        if (cardType === CardNetworkType.VISA || cardType === CardNetworkType.MASTERCARD) {
          return isValid && cardNumber.length === 16 ? null : { invalidCardNumber: true };
        }

        return isValid ? null : { invalidCardNumber: true };
      }
    };
  }

  private cardNetworkValidator(cardId?: string): ValidatorFn {
    return (): ValidationErrors | null => {
      if (Object.keys(this.fg.controls).length > 0) {
        const cardNumber = cardId ? this.getFullCardNumber(cardId) : (this.fg.controls.card_number.value as string);
        const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

        if (
          cardType === CardNetworkType.OTHERS ||
          (!this.isVisaRTFEnabled && cardType === CardNetworkType.VISA) ||
          (!this.isMastercardRTFEnabled && cardType === CardNetworkType.MASTERCARD)
        ) {
          return { invalidCardNetwork: true };
        }

        return null;
      }
    };
  }

  private handleEnrollmentCompletion(): void {
    this.cardsEnrolling = false;
    if (this.cardsList.failedCards.length > 0) {
      this.showErrorPopover();
    } else {
      this.trackingService.eventTrack('Connect Cards Onboarding Step - Completed', {
        numberOfCards: this.cardsList.successfulCards.length,
      });
      this.isStepComplete.emit(true);
    }
  }
}
