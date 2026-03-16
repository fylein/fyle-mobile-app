import {
  Component,
  Input,
  input,
  output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { PlatformCorporateCardDetail } from 'src/app/core/models/platform-corporate-card-detail.model';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { AddCardComponent } from '../add-card/add-card.component';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

@Component({
  selector: 'app-spent-cards',
  templateUrl: './spent-cards.component.html',
  styleUrls: ['./spent-cards.component.scss'],
  imports: [CardDetailComponent, AddCardComponent],
})
export class SpentCardsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer?: ElementRef<HTMLElement>;

  readonly cardDetails = input<PlatformCorporateCardDetail[]>();

  readonly homeCurrency = input<string>(undefined);

  readonly currencySymbol = input<string>(undefined);

  @Input() showAddCardSlide: boolean;

  readonly addCardClick = output<void>();

  private swiperInstance: Swiper | null = null;

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  ngOnDestroy(): void {
    this.swiperInstance?.destroy(true, true);
    this.swiperInstance = null;
  }

  private initSwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Pagination],
      slidesPerView: 1.1,
      spaceBetween: 16,
      centeredSlides: (this.cardDetails()?.length ?? 0) === 1 && !this.showAddCardSlide,
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
        renderBullet(index: number, className: string): string {
          return `<span class="spent-cards ${className}"></span>`;
        },
      },
    });
  }
}
