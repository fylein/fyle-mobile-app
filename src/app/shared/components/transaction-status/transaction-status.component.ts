import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { NgClass, TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-transaction-status',
  templateUrl: './transaction-status.component.html',
  styleUrls: ['./transaction-status.component.scss'],
  standalone: true,
  imports: [NgClass, IonicModule, TitleCasePipe, TranslocoPipe],
})
export class TransactionStatusComponent {
  @Input() transactionStatus: ExpenseTransactionStatus;

  @Output() statusClick: EventEmitter<ExpenseTransactionStatus> = new EventEmitter<ExpenseTransactionStatus>();

  get TransactionStatus(): typeof ExpenseTransactionStatus {
    return ExpenseTransactionStatus;
  }
}
