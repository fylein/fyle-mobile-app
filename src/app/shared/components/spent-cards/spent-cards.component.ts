import { Component, Input, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { Observable } from 'rxjs';
import { PlatformCorporateCardDetails } from 'src/app/core/models/platform-corporate-card-details.model';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-spent-cards',
  templateUrl: './spent-cards.component.html',
  styleUrls: ['./spent-cards.component.scss'],
})
export class SpentCardsComponent {
  @Input() spentCards: PlatformCorporateCardDetails[];

  @Input() homeCurrency: Observable<string>;

  @Input() currencySymbol: Observable<string>;

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="spent-cards ' + className + '"> </span>';
    },
  };
}
