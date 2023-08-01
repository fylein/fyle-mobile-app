import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';

@Component({
  selector: 'app-corporate-card',
  templateUrl: './corporate-card.component.html',
  styleUrls: ['./corporate-card.component.scss'],
})
export class CorporateCardComponent {
  @Input() card: PlatformCorporateCard;

  @Input() isVisaRTFEnabled: boolean;

  @Input() isMastercardRTFEnabled: boolean;

  @Output() cardOptionsClick: EventEmitter<PlatformCorporateCard> = new EventEmitter<PlatformCorporateCard>();
}
