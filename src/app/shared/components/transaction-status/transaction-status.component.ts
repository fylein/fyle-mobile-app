import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';

@Component({
  selector: 'app-transaction-status',
  templateUrl: './transaction-status.component.html',
  styleUrls: ['./transaction-status.component.scss'],
  standalone: false,
})
export class TransactionStatusComponent {
  @Input() transactionStatus: ExpenseTransactionStatus;

  @Output() statusClick: EventEmitter<ExpenseTransactionStatus> = new EventEmitter<ExpenseTransactionStatus>();

  get TransactionStatus(): typeof ExpenseTransactionStatus {
    return ExpenseTransactionStatus;
  }
}
