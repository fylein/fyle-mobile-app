import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-spent-cards',
  templateUrl: './spent-cards.component.html',
  styleUrls: ['./spent-cards.component.scss'],
})
export class SpentCardsComponent implements OnInit {
  @Input() spentCards: any;

  @Input() homeCurrency: any;

  @Input() currencySymbol: any;

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    dynamicBullets: true,
    renderBullet(index, className) {
      return '<span class="fyle ' + className + '"> </span>';
    },
  };

  constructor() {}

  ngOnInit() {}
}
