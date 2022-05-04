import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-transaction-preview',
  templateUrl: './card-transaction-preview.component.html',
  styleUrls: ['./card-transaction-preview.component.scss'],
})
export class CardTransactionPreviewComponent implements OnInit {
  @Input() transactionDetails;

  constructor() {}

  ngOnInit() {}
}
