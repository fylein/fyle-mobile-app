import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs';
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

  cardNetworkTypes: typeof CardNetworkType = CardNetworkType;

  constructor(private popoverController: PopoverController, private realTimeFeedService: RealTimeFeedService) {}

  ngOnInit(): void {
    // TODO: Add validations for the card number
    this.cardForm = new FormControl('');
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
    // TODO: Handle card enrollment
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
}
