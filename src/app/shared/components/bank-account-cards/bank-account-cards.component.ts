import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PersonalCard } from 'src/app/core/models/personal_card.model';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';

// install Swiper modules
SwiperCore.use([Pagination]);
@Component({
  selector: 'app-bank-account-cards',
  templateUrl: './bank-account-cards.component.html',
  styleUrls: ['./bank-account-cards.component.scss'],
})
export class BankAccountCardsComponent implements OnInit {
  @Input() linkedAccounts: PersonalCard[];

  @Input() minimal: boolean;

  @Output() deleted = new EventEmitter();

  @Output() changed = new EventEmitter();

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    renderBullet(index, className): string {
      return '<span class="fyle ' + className + '"> </span>';
    },
  };

  constructor() {}

  ngOnInit(): void {}

  onDeleted(): void {
    this.deleted.emit();
  }

  onCardChange(event): void {
    if (!this.minimal && event.length && this.linkedAccounts[event[0].realIndex].id) {
      this.changed.emit(this.linkedAccounts[event[0].realIndex]?.id);
    }
  }
}
