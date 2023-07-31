import { Component, Input } from '@angular/core';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';

@Component({
  selector: 'app-corporate-card',
  templateUrl: './corporate-card.component.html',
  styleUrls: ['./corporate-card.component.scss'],
})
export class CorporateCardComponent {
  @Input() card: PlatformCorporateCard;
}
