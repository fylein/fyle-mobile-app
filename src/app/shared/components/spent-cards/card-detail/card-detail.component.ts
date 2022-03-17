import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CardDetail } from 'src/app/core/models/card-detail.model';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  @Input() cardDetail: CardDetail[];

  @Input() homeCurrency: Observable<string>;

  @Input() currencySymbol: Observable<string>;

  constructor() {}

  ngOnInit() {}
}
