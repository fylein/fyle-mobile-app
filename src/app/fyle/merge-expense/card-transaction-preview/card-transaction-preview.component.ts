import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-transaction-preview',
  templateUrl: './card-transaction-preview.component.html',
  styleUrls: ['./card-transaction-preview.component.scss'],
  standalone: false,
})
export class CardTransactionPreviewComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() transactionDetails;

  constructor() {}

  ngOnInit() {}
}
