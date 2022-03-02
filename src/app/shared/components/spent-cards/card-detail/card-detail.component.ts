import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  @Input() cardDetail: any;

  @Input() homeCurrency: any;

  @Input() currencySymbol: any;

  constructor() {}

  ngOnInit() {}
}
