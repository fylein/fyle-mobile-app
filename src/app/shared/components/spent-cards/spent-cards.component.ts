import { Component, EventEmitter, Input, Output } from '@angular/core';
import SwiperCore, { Pagination } from 'swiper';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { PaginationOptions } from 'swiper/types';
import { SwiperModule } from 'swiper/angular';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { AddCardComponent } from '../add-card/add-card.component';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
    selector: 'app-spent-cards',
    templateUrl: './spent-cards.component.html',
    styleUrls: ['./spent-cards.component.scss'],
    imports: [
        SwiperModule,
        CardDetailComponent,
        AddCardComponent,
    ],
})
export class SpentCardsComponent {
  @Input() cardDetails: PlatformCorporateCardDetail[];

  @Input() homeCurrency: string;

  @Input() currencySymbol: string;

  @Input() showAddCardSlide: boolean;

  @Output() addCardClick = new EventEmitter<void>();

  pagination: PaginationOptions = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="spent-cards ' + className + '"> </span>';
    },
  };
}
