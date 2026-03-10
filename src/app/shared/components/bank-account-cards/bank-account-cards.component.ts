import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { NgClass } from '@angular/common';
import { BankAccountCardComponent } from './bank-account-card/bank-account-card.component';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';

@Component({
  selector: 'app-bank-account-cards',
  templateUrl: './bank-account-cards.component.html',
  styleUrls: ['./bank-account-cards.component.scss'],
  imports: [NgClass, BankAccountCardComponent],
})
export class BankAccountCardsComponent implements AfterViewInit, OnDestroy {
  readonly swiperContainer = viewChild<ElementRef<HTMLElement>>('swiperContainer');

  @Input() linkedAccounts: PlatformPersonalCard[];

  @Input() minimal: boolean;

  readonly deleted = output();

  readonly changed = output<PlatformPersonalCard>();

  pagination = {
    renderBullet(index: number, className: string): string {
      return '<span class="fyle ' + className + '"> </span>';
    },
  };

  private swiperInstance: Swiper | null = null;

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  ngOnDestroy(): void {
    this.swiperInstance?.destroy(true, true);
    this.swiperInstance = null;
  }

  onDeleted(): void {
    this.deleted.emit();
  }

  private onCardChange(swiper: Swiper): void {
    if (!this.minimal && swiper?.realIndex !== undefined && this.linkedAccounts?.[swiper.realIndex]) {
      this.changed.emit(this.linkedAccounts[swiper.realIndex]);
    }
  }

  private initSwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    this.swiperInstance = new Swiper(this.swiperContainer()?.nativeElement, {
      modules: [Pagination],
      slidesPerView: 1.1,
      spaceBetween: 5,
      centeredSlides: true,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        ...this.pagination,
      },
      on: {
        init: (swiper) => this.onCardChange(swiper),
        slideChange: (swiper) => this.onCardChange(swiper),
      },
    });
  }
}
