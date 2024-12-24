import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';

@Component({
  selector: 'app-spender-onboarding-connect-card-step',
  templateUrl: './spender-onboarding-connect-card-step.component.html',
  styleUrls: ['./spender-onboarding-connect-card-step.component.scss'],
})
export class SpenderOnboardingConnectCardStepComponent {
  @Input() readOnly?: boolean = false;

  @Input() orgSettings: OrgSettings;

  @Output() isStepCompleted: EventEmitter<boolean> = new EventEmitter<boolean>();

  cardForm: FormControl;

  isVisaRTFEnabled = false;

  isMastercardRTFEnabled = false;

  cardType = CardNetworkType;

  constructor(
    private corporateCreditCardExpensesService: CorporateCreditCardExpenseService,
    private realTimeFeedService: RealTimeFeedService
  ) {}

  ionViewWillEnter(): void {
    this.cardForm = new FormControl('', [this.cardNumberValidator.bind(this), this.cardNetworkValidator.bind(this)]);
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
      (!this.isVisaRTFEnabled && cardType === CardNetworkType.VISA) ||
      (!this.isMastercardRTFEnabled && cardType === CardNetworkType.MASTERCARD)
    ) {
      return { invalidCardNetwork: true };
    }

    return null;
  }
}
