import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { Observable } from 'rxjs';
import { CardDetail } from 'src/app/core/models/card-detail.model';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-spent-cards',
  templateUrl: './spent-cards.component.html',
  styleUrls: ['./spent-cards.component.scss'],
})
export class SpentCardsComponent implements OnInit {
  @Input() spentCards: CardDetail[];

  @Input() homeCurrency: Observable<string>;

  @Input() currencySymbol: Observable<string>;

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  pagination = {
    dynamicBullets: true,
    renderBullet(index, className) {
      return '<span class="spent-cards ' + className + '"> </span>';
    },
  };

  constructor() {}

  ngOnInit() {}
}
