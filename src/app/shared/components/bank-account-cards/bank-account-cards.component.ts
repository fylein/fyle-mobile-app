import { Component, Input, output, viewChild } from '@angular/core';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper } from 'swiper/types';
import { NgClass } from '@angular/common';
import { BankAccountCardComponent } from './bank-account-card/bank-account-card.component';

// install Swiper modules
SwiperCore.use([Pagination]);
@Component({
  selector: 'app-bank-account-cards',
  templateUrl: './bank-account-cards.component.html',
  styleUrls: ['./bank-account-cards.component.scss'],
  imports: [NgClass, SwiperModule, BankAccountCardComponent],
})
export class BankAccountCardsComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() linkedAccounts: PlatformPersonalCard[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() minimal: boolean;

  readonly deleted = output();

  readonly changed = output<PlatformPersonalCard>();

  readonly swiper = viewChild<SwiperComponent>('swiper');

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
