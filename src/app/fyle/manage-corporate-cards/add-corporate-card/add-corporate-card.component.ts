import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';

// Move this to different file
enum RTFCardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  OTHERS = 'OTHERS',
}

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

  rtfCardTypes: typeof RTFCardType = RTFCardType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    this.cardForm = new FormControl('', [
      Validators.required,
      Validators.maxLength(16),
      Validators.minLength(16),
      (control: AbstractControl): ValidationErrors => {
        // Reactive forms are not strongly typed in Angular 13, so we need to cast the value to string
        // TODO (Angular 14 >): Remove the type casting and directly use string type for the form control
        const isValid = this.realTimeFeedService.isCardNumberValid(control.value as string);
        return isValid ? null : { invalidCardNumber: true };
      },
      (control: AbstractControl): ValidationErrors => {
        const cardType = this.realTimeFeedService.getCardType(control.value as string);

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
      },
    ]);

    this.cardForm.valueChanges.pipe(distinctUntilChanged()).subscribe((value: string) => {
      this.cardType = this.realTimeFeedService.getCardType(value);
    });
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  enrollCard(): void {
    if (this.cardForm.invalid) {
      return;
    }
    // TODO: Enroll Card
  }
}
