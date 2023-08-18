import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { catchError, distinctUntilChanged, finalize, of } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';

@Component({
  selector: 'app-add-corporate-card',
  templateUrl: './add-corporate-card.component.html',
  styleUrls: ['./add-corporate-card.component.scss'],
})
export class AddCorporateCardComponent implements OnInit {
  @Input() isVisaRTFEnabled: boolean;

  @Input() isMastercardRTFEnabled: boolean;

  @Input() isYodleeEnabled: boolean;

  cardForm: FormControl;

  cardType: CardNetworkType;

  cardNetworks: CardNetworkType[];

  isAddingNonRTFCard: boolean;

  enrollmentFailureMessage: string;

  isEnrollingCard: boolean;

  cardNetworkTypes: typeof CardNetworkType = CardNetworkType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    this.cardForm = new FormControl('', [this.cardNumberValidator.bind(this), this.cardNetworkValidator.bind(this)]);

    this.cardNetworks = this.getAllowedCardNetworks();

    this.cardForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value: string) => {
      this.cardType = this.realTimeFeedService.getCardType(value);
      this.cardNetworks = this.getCardNetworks();

      this.isAddingNonRTFCard = this.cardType === CardNetworkType.OTHERS && this.cardForm.valid;
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

    this.isEnrollingCard = true;

    this.realTimeFeedService
      .enroll(cardNumber)
      .pipe(
        catchError((error: Error) => {
          this.handleEnrollmentFailures(error);
          return of(null);
        }),
        finalize(() => {
          this.isEnrollingCard = false;
        })
      )
      .subscribe(() => {
        this.handleEnrollmentSuccess();
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

    if (cardNetwork && cardNetwork !== CardNetworkType.OTHERS) {
      cardNetworks.push(cardNetwork);
    } else {
      cardNetworks.push(...this.getAllowedCardNetworks());
    }

    return cardNetworks;
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors {
    // Reactive forms are not strongly typed in Angular 13, so we need to cast the value to string
    // TODO (Angular 14 >): Remove the type casting and directly use string type for the form control
    const cardNumber = control.value as string;

    const isValid = this.realTimeFeedService.isCardNumberValid(cardNumber);
    const cardType = this.realTimeFeedService.getCardType(cardNumber);

    if (cardType === CardNetworkType.VISA || cardType === CardNetworkType.MASTERCARD) {
      return isValid && cardNumber.length === 16 ? null : { invalidCardNumber: true };
    }

    return isValid ? null : { invalidCardNumber: true };
  }

  private cardNetworkValidator(control: AbstractControl): ValidationErrors {
    const cardNumber = control.value as string;
    const cardType = this.realTimeFeedService.getCardType(cardNumber);

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
    this.cardForm.setErrors({ enrollmentError: true });
    this.enrollmentFailureMessage = error.message || 'Something went wrong. Please try after some time.';
  }

  private handleEnrollmentSuccess(): void {
    this.popoverController.dismiss({ success: true });
  }
}
