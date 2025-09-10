import { Component, Input, output } from '@angular/core';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { NgClass, TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-transaction-status',
  templateUrl: './transaction-status.component.html',
  styleUrls: ['./transaction-status.component.scss'],
  imports: [NgClass, IonicModule, TitleCasePipe, TranslocoPipe],
})
export class TransactionStatusComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() transactionStatus: ExpenseTransactionStatus;

  readonly statusClick = output<ExpenseTransactionStatus>();

  get TransactionStatus(): typeof ExpenseTransactionStatus {
    return ExpenseTransactionStatus;
  }
}
