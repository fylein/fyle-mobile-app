import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { catchError, concatMap, from, map, of } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

@Component({
  selector: 'app-spender-onboarding-connect-card-step',
  templateUrl: './spender-onboarding-connect-card-step.component.html',
  styleUrls: ['./spender-onboarding-connect-card-step.component.scss'],
})
export class SpenderOnboardingConnectCardStepComponent implements OnInit, OnChanges {
  @Input() readOnly?: boolean = false;

  @Input() orgSettings: OrgSettings;

  @Output() isStepComplete: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() isStepSkipped: EventEmitter<boolean> = new EventEmitter<boolean>();

  cardForm: FormControl;

  isVisaRTFEnabled = false;

  isMastercardRTFEnabled = false;

  cardType = CardNetworkType;

  enrollableCards: PlatformCorporateCard[] = [];

  cardValuesMap: Record<
    string,
    { card_type: string; last_four: string; enrollment_error?: string; enrollment_success?: boolean }
  > = {};

  rtfCardType: CardNetworkType;

  cardsLoading = true;

  singleEnrollableCardDetails: { card_type: string; card_number: string } = {
    card_type: '',
    card_number: '',
  };

  cardsList: PopoverCardsList = {
    successfulCards: [],
    failedCards: [],
  };

  fg: FormGroup;

  cardsEnrolling = false;

  singularEnrollmentFailure: string;

  constructor(
    private corporateCreditCardExpensesService: CorporateCreditCardExpenseService,
    private realTimeFeedService: RealTimeFeedService,
    private fb: FormBuilder,
    private popoverController: PopoverController
  ) {}

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
              this.setupErrorMessages(error, `${card.card_number.slice(-4)}`, card.id);
              return of(error);
            })
          )
        )
      )
      .subscribe(() => {
        this.cardsEnrolling = false;
        if (this.cardsList.failedCards.length > 0) {
          this.showErrorPopover();
        } else {
          this.isStepComplete.emit(true);
        }
      });
  }

  enrollSingularCard(): void {
    this.realTimeFeedService
      .enroll(this.fg.controls.card_number.value as string)
      .pipe(
        map(() => {
          this.cardsList.successfulCards.push(`**** ${(this.fg.controls.card_number.value as string).slice(-4)}`);
        }),
        catchError((error: HttpErrorResponse) => {
          this.setupErrorMessages(error, (this.fg.controls.card_number.value as string).slice(-4));
          return of(error);
        })
      )
      .subscribe(() => {
        this.cardsEnrolling = false;
        if (this.cardsList.failedCards.length > 0) {
          this.showErrorPopover();
        } else {
          this.isStepComplete.emit(true);
        }
      });
  }

  enrollCards(): void {
    this.cardsList = {
      successfulCards: [],
      failedCards: [],
    };
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
      return 'We ran into an issue while processing your request. You can cancel and retry connecting the failed card or proceed to the next step.';
    } else if (this.cardsList.failedCards.length > 1) {
      return `We ran into an issue while processing your request for the cards  ${this.cardsList.failedCards
        .slice(0, this.cardsList.failedCards.length - 1)
        .join(', ')} and ${this.cardsList.failedCards.slice(
        -1
      )}. You can cancel and retry connecting the failed card or proceed to the next step.`;
    } else {
      return `We ran into an issue while processing your request for the card ${this.cardsList.failedCards[0]}. You can cancel and retry connecting the failed card or proceed to the next step.`;
    }
  }

  async showErrorPopover(): Promise<void> {
    const errorPopover = await this.popoverController.create({
      componentProps: {
        title: this.cardsList.successfulCards.length > 0 ? 'Status summary' : 'Failed connecting',
        message: this.generateMessage(),
        primaryCta: {
          text: 'Proceed anyway',
          action: 'close',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
        cardsList: this.cardsList.successfulCards.length > 0 ? this.cardsList : {},
      },
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
    });

    await errorPopover.present();

    const { data } = (await errorPopover.onWillDismiss()) as OverlayResponse<{
      action: string;
    }>;

    if (data.action === 'close') {
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
                new FormControl('', [
                  Validators.required,
                  Validators.maxLength(12),
                  this.cardNumberValidator(card.id),
                  this.cardNetworkValidator(card.id),
                ])
              );
            });
          } else {
            this.singleEnrollableCardDetails = {
              card_number: null,
              card_type: CardNetworkType.OTHERS,
            };
            this.fg.addControl(
              'card_number',
              new FormControl('', [
                Validators.required,
                Validators.maxLength(16),
                this.cardNumberValidator(),
                this.cardNetworkValidator(),
              ])
            );
          }
          this.cardsLoading = false;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.fg = this.fb.group({});
    this.setupForm();
  }

  onCardNumberUpdate(card?: PlatformCorporateCard): void {
    if (this.enrollableCards.length > 0) {
      this.cardValuesMap[card.id].card_type = this.realTimeFeedService.getCardTypeFromNumber(
        this.fg.controls[`card_number_${card.id}`].value as string
      );
    } else {
      this.singleEnrollableCardDetails.card_type = this.realTimeFeedService.getCardTypeFromNumber(
        this.fg.controls.card_number.value as string
      );
    }
  }

  private handleEnrollmentFailures(error: Error, cardId?: string): void {
    const enrollmentFailureMessage = error.message || 'Something went wrong. Please try after some time.';
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
      const cardNumber = cardId ? this.getFullCardNumber(cardId) : (this.fg.controls.card_number.value as string);

      const isValid = this.realTimeFeedService.isCardNumberValid(cardNumber);
      const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

      if (cardType === CardNetworkType.VISA || cardType === CardNetworkType.MASTERCARD) {
        return isValid && cardNumber.length === 16 ? null : { invalidCardNumber: true };
      }

      return isValid ? null : { invalidCardNumber: true };
    };
  }

  private cardNetworkValidator(cardId?: string): ValidatorFn {
    return (): ValidationErrors | null => {
      const cardNumber = cardId ? this.getFullCardNumber(cardId) : (this.fg.controls.card_number.value as string);
      const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

      if (
        (!this.isVisaRTFEnabled && cardType === CardNetworkType.VISA) ||
        (!this.isMastercardRTFEnabled && cardType === CardNetworkType.MASTERCARD)
      ) {
        return { invalidCardNetwork: true };
      }

      return null;
    };
  }
}
