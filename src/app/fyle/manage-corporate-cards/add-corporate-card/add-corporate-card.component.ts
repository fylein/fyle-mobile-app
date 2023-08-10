import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { catchError, distinctUntilChanged, throwError } from 'rxjs';
import { RTFCardType } from 'src/app/core/enums/rtf-card-type.enum';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
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

  cardType: RTFCardType;

  enrollmentFailureMessage: string;

  cardNetworksText: string;

  rtfCardTypes: typeof RTFCardType = RTFCardType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    this.cardForm = new FormControl('', [this.cardNumberValidator.bind(this), this.cardIssuerValidator.bind(this)]);
    this.updateTnc();

    this.cardForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value: string) => {
      this.cardType = this.realTimeFeedService.getCardType(value);
      this.updateTnc();
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

    this.realTimeFeedService
      .enroll(cardNumber)
      .pipe(
        catchError((error: Error) => {
          this.handleEnrollmentFailures(error);
          return throwError(() => error);
        })
      )
      .subscribe((enrolledCard) => {
        this.handleEnrollmentSuccess(enrolledCard);
      });
  }

  private updateTnc(): void {
    const cardNetworks = [];

    if (!this.cardType || this.cardType === RTFCardType.OTHERS) {
      cardNetworks.push(...this.getAllowedCardNetworks());
    } else {
      cardNetworks.push(this.getSelectedCardNetwork());
    }

    switch (cardNetworks.length) {
      case 1:
        this.cardNetworksText = `${cardNetworks[0]}`;
        break;
      case 2:
        this.cardNetworksText = `${cardNetworks[0]} and ${cardNetworks[1]}`;
        break;
      case 3:
        this.cardNetworksText = `${cardNetworks[0]}, ${cardNetworks[1]} and ${cardNetworks[2]}`;
        break;
    }
  }

  private getAllowedCardNetworks(): string[] {
    const cardNetworks: string[] = [];

    if (this.isVisaRTFEnabled) {
      cardNetworks.push('Visa');
    }
    if (this.isMastercardRTFEnabled) {
      cardNetworks.push('Mastercard');
    }
    if (this.isYodleeEnabled) {
      cardNetworks.push('Others');
    }

    return cardNetworks;
  }

  private getSelectedCardNetwork(): string {
    const cardTypeMap: Record<RTFCardType, string> = {
      [RTFCardType.VISA]: 'Visa',
      [RTFCardType.MASTERCARD]: 'Mastercard',
      [RTFCardType.OTHERS]: 'Others',
    };

    return cardTypeMap[this.cardType];
  }

  private cardNumberValidator(control: AbstractControl): ValidationErrors {
    // Reactive forms are not strongly typed in Angular 13, so we need to cast the value to string
    // TODO (Angular 14 >): Remove the type casting and directly use string type for the form control
    const cardNumber = control.value as string;

    const isValid = this.realTimeFeedService.isCardNumberValid(cardNumber);
    const cardType = this.realTimeFeedService.getCardType(cardNumber);

    if (cardType === RTFCardType.VISA || cardType === RTFCardType.MASTERCARD) {
      return isValid && cardNumber.length === 16 ? null : { invalidCardNumber: true };
    }

    return isValid ? null : { invalidCardNumber: true };
  }

  private cardIssuerValidator(control: AbstractControl): ValidationErrors {
    const cardNumber = control.value as string;
    const cardType = this.realTimeFeedService.getCardType(cardNumber);

    if (!this.isYodleeEnabled && cardType === RTFCardType.OTHERS) {
      return { invalidCardIssuer: true };
    }

    if (!this.isVisaRTFEnabled && cardType === RTFCardType.VISA) {
      return { invalidCardIssuer: true };
    }

    if (!this.isMastercardRTFEnabled && cardType === RTFCardType.MASTERCARD) {
      return { invalidCardIssuer: true };
    }

    return null;
  }

  private handleEnrollmentFailures(error: Error): void {
    this.cardForm.setErrors({ enrollmentError: true });
    this.enrollmentFailureMessage = error.message || 'Something went wrong. Please try after some time.';
  }

  private handleEnrollmentSuccess(enrolledCard: PlatformCorporateCard): void {
    console.log(enrolledCard);
    this.popoverController.dismiss({ success: true });
  }
}
