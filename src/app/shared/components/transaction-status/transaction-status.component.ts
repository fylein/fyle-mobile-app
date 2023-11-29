import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionStatus } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-transaction-status',
  templateUrl: './transaction-status.component.html',
  styleUrls: ['./transaction-status.component.scss'],
})
export class TransactionStatusComponent {
  @Input() transactionStatus: TransactionStatus;

  @Output() statusClick: EventEmitter<TransactionStatus> = new EventEmitter<TransactionStatus>();

  get TransactionStatus(): typeof TransactionStatus {
    return TransactionStatus;
  }
}
