import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { catchError, distinctUntilChanged, finalize, throwError } from 'rxjs';
import { RTFCardType } from 'src/app/core/enums/rtf-card-type.enum';
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

  cardNetworks: string[];

  isAddingNonRTFCard: boolean;

  enrollmentFailureMessage: string;

  isEnrollingCard: boolean;

  rtfCardTypes: typeof RTFCardType = RTFCardType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    this.cardForm = new FormControl('', [this.cardNumberValidator.bind(this), this.cardIssuerValidator.bind(this)]);

    this.cardNetworks = this.getAllowedCardNetworks();

    this.cardForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value: string) => {
      this.cardType = this.realTimeFeedService.getCardType(value);
      this.cardNetworks = this.getCardNetworks();

      this.isAddingNonRTFCard = this.cardType === RTFCardType.OTHERS && this.cardForm.valid;
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
          return throwError(() => error);
        }),
        finalize(() => {
          this.isEnrollingCard = false;
        })
      )
      .subscribe(() => {
        this.handleEnrollmentSuccess();
      });
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

  private getCardNetworks(): string[] {
    const cardNetworks: string[] = [];

    const cardTypeMap: Record<RTFCardType, string> = {
      [RTFCardType.VISA]: 'Visa',
      [RTFCardType.MASTERCARD]: 'Mastercard',
      [RTFCardType.OTHERS]: 'Others',
    };

    const cardNetwork = cardTypeMap[this.cardType];
    if (cardNetwork) {
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

  private handleEnrollmentSuccess(): void {
    this.popoverController.dismiss({ success: true });
  }
}
