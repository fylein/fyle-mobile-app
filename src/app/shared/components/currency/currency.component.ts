import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit {

  @Input() options: any;
  @Input() currencyObj: any;
  constructor() { }

  ngOnInit() {
  }

}
