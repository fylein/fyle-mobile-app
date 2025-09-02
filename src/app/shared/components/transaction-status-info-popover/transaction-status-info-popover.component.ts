import { Component, inject, input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';

@Component({
  selector: 'app-transaction-status-info-popover',
  templateUrl: './transaction-status-info-popover.component.html',
  styleUrls: ['./transaction-status-info-popover.component.scss'],
  standalone: false,
})
export class TransactionStatusInfoPopoverComponent {
  private popoverController = inject(PopoverController);

  readonly transactionStatus = input<ExpenseTransactionStatus>(undefined);

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
