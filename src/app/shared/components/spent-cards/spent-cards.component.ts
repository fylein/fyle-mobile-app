import { Component, Input, input, output } from '@angular/core';
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
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cardDetails: PlatformCorporateCardDetail[];

  readonly homeCurrency = input<string>(undefined);

  readonly currencySymbol = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showAddCardSlide: boolean;

  readonly addCardClick = output<void>();

  pagination: PaginationOptions = {
    dynamicBullets: true,
    renderBullet(index, className): string {
      return '<span class="spent-cards ' + className + '"> </span>';
    },
  };
}
