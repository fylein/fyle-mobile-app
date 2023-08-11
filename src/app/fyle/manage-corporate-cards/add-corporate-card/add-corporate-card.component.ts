import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs';
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

  rtfCardTypes: typeof RTFCardType = RTFCardType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    // TODO: Add validations for the card number
    this.cardForm = new FormControl('');
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
    // TODO: Handle card enrollment
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
}
