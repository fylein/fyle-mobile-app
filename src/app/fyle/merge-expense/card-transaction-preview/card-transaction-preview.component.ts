import { Component, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EllipsisPipe } from '../../../shared/pipes/ellipses.pipe';
import { FyCurrencyPipe } from '../../../shared/pipes/fy-currency.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-card-transaction-preview',
  templateUrl: './card-transaction-preview.component.html',
  styleUrls: ['./card-transaction-preview.component.scss'],
  standalone: true,
  imports: [MatIcon, CurrencyPipe, DatePipe, EllipsisPipe, FyCurrencyPipe, TranslocoPipe],
})
export class CardTransactionPreviewComponent implements OnInit {
  @Input() transactionDetails;

  constructor() {}

  ngOnInit() {}
}
