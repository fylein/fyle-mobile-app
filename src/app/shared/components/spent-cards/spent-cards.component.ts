import { Component, Input, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-spent-cards',
  templateUrl: './spent-cards.component.html',
  styleUrls: ['./spent-cards.component.scss'],
})
export class SpentCardsComponent {
  @Input() cardDetails: PlatformCorporateCardDetail[];

  @Input() homeCurrency: string;

  @Input() currencySymbol: string;

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="spent-cards ' + className + '"> </span>';
    },
  };
}
