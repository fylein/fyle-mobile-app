import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { catchError, distinctUntilChanged, filter, finalize, of } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-add-corporate-card',
  templateUrl: './add-corporate-card.component.html',
  styleUrls: ['./add-corporate-card.component.scss'],
})
export class AddCorporateCardComponent implements OnInit {
  @Input() isVisaRTFEnabled: boolean;

  @Input() isMastercardRTFEnabled: boolean;

  @Input() isYodleeEnabled: boolean;

  @Input() card: PlatformCorporateCard;

  @Input() cardType: CardNetworkType;

  cardForm: FormControl;

  cardNetworks: CardNetworkType[];

  isAddingNonRTFCard: boolean;

  enrollmentFailureMessage: string;

  isEnrollingCard: boolean;

  cardNetworkTypes: typeof CardNetworkType = CardNetworkType;

  constructor(
    private popoverController: PopoverController,
    private realTimeFeedService: RealTimeFeedService,
    private trackingService: TrackingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cardForm = new FormControl('', [this.cardNumberValidator.bind(this), this.cardNetworkValidator.bind(this)]);

    this.cardNetworks = this.getCardNetworks();

    this.cardForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value: string) => {
      this.cardType = this.realTimeFeedService.getCardTypeFromNumber(value);
      this.cardNetworks = this.getCardNetworks();
      this.isAddingNonRTFCard = this.cardType === CardNetworkType.OTHERS && this.cardForm.valid;

      if (this.isAddingNonRTFCard) {
        this.trackingService.enrollingNonRTFCard({
          'Existing Card': this.card ? this.card.card_number : '',
          'Card Number': `${value.slice(0, 4)} **** **** ${value.slice(12)}`,
          Source: this.router.url,
        });
      }
    });

    this.cardForm.statusChanges
      .pipe(
        distinctUntilChanged(),
        filter((status) => status === 'INVALID')
      )
      .subscribe(() => {
        this.trackEnrollmentErrors();
      });
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  enrollCard(): void {
    if (this.cardForm.invalid) {
      return;
    }

    const cardNumber = this.cardForm.value as string;
    const existingCardId = this.card ? this.card.id : null;

    this.isEnrollingCard = true;

    this.realTimeFeedService
      .enroll(cardNumber, existingCardId)
      .pipe(
        catchError((error: Error) => {
          this.handleEnrollmentFailures(error);
          return of(null);
        }),
        finalize(() => {
          this.isEnrollingCard = false;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.handleEnrollmentSuccess(res);
        }
      });
  }

  private trackEnrollmentErrors(): void {
    const cardNumber = this.cardForm.value as string;
    let error = '';

    if (this.cardForm.errors.invalidCardNumber) {
      error = 'Invalid card number';
    } else if (this.cardForm.errors.invalidCardNetwork) {
      error = 'Invalid card network';
    } else if (this.cardForm.errors.enrollmentError) {
      error = this.enrollmentFailureMessage;
    }

    this.trackingService.cardEnrollmentErrors({
      'Card Network': this.cardType,
      'Existing Card': this.card ? this.card.card_number : '',
      'Error Message': error,
      'Card Number': `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(12)}`,
      Source: this.router.url,
    });
  }

  private getAllowedCardNetworks(): CardNetworkType[] {
    const cardNetworks: CardNetworkType[] = [];

    if (this.isVisaRTFEnabled) {
      cardNetworks.push(CardNetworkType.VISA);
    }
    if (this.isMastercardRTFEnabled) {
      cardNetworks.push(CardNetworkType.MASTERCARD);
    }
    if (this.isYodleeEnabled) {
      cardNetworks.push(CardNetworkType.OTHERS);
    }

    return cardNetworks;
  }

  private getCardNetworks(): CardNetworkType[] {
    const cardNetworks: CardNetworkType[] = [];

    const cardNetwork = this.cardType;
    const allowedCardNetworks = this.getAllowedCardNetworks();
    const isCardNetworkSupported = allowedCardNetworks.includes(cardNetwork);

    if (cardNetwork && cardNetwork !== CardNetworkType.OTHERS && isCardNetworkSupported) {
      cardNetworks.push(cardNetwork);
    } else {
      cardNetworks.push(...allowedCardNetworks);
    }

    return cardNetworks;
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors {
    // Reactive forms are not strongly typed in Angular 13, so we need to cast the value to string
    // TODO (Angular 14 >): Remove the type casting and directly use string type for the form control
    const cardNumber = control.value as string;

    const isValid = this.realTimeFeedService.isCardNumberValid(cardNumber);
    const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

    if (cardType === CardNetworkType.VISA || cardType === CardNetworkType.MASTERCARD) {
      return isValid && cardNumber.length === 16 ? null : { invalidCardNumber: true };
    }

    return isValid ? null : { invalidCardNumber: true };
  }

  private cardNetworkValidator(control: AbstractControl): ValidationErrors {
    const cardNumber = control.value as string;
    const cardType = this.realTimeFeedService.getCardTypeFromNumber(cardNumber);

    if (
      (!this.isYodleeEnabled && cardType === CardNetworkType.OTHERS) ||
      (!this.isVisaRTFEnabled && cardType === CardNetworkType.VISA) ||
      (!this.isMastercardRTFEnabled && cardType === CardNetworkType.MASTERCARD)
    ) {
      return { invalidCardNetwork: true };
    }

    return null;
  }

  private handleEnrollmentFailures(error: Error): void {
    this.enrollmentFailureMessage = error.message || 'Something went wrong. Please try after some time.';
    this.cardForm.setErrors({ enrollmentError: true });
  }

  private handleEnrollmentSuccess(card: PlatformCorporateCard): void {
    this.trackingService.cardEnrolled({
      'Card Network': this.cardType,
      'Existing Card': this.card ? this.card.card_number : '',
      'Card ID': card.id,
      Source: this.router.url,
    });

    this.popoverController.dismiss({ success: true });
  }
}
