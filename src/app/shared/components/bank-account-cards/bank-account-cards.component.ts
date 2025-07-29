import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper } from 'swiper/types';

// install Swiper modules
SwiperCore.use([Pagination]);
@Component({
  selector: 'app-bank-account-cards',
  templateUrl: './bank-account-cards.component.html',
  styleUrls: ['./bank-account-cards.component.scss'],
  standalone: false,
})
export class BankAccountCardsComponent {
  @Input() linkedAccounts: PlatformPersonalCard[];

  @Input() minimal: boolean;

  @Output() deleted = new EventEmitter();

  @Output() changed = new EventEmitter<PlatformPersonalCard>();

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    renderBullet(index, className): string {
      return '<span class="fyle ' + className + '"> </span>';
    },
  };

  onDeleted(): void {
    this.deleted.emit();
  }

  onCardChange(event: Swiper[]): void {
    if (!this.minimal && event.length && event[0].realIndex !== undefined && this.linkedAccounts[event[0].realIndex]) {
      this.changed.emit(this.linkedAccounts[event[0].realIndex]);
    }
  }
}
