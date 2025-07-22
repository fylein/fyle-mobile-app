import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { MatIcon } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-transaction-status-info-popover',
  templateUrl: './transaction-status-info-popover.component.html',
  styleUrls: ['./transaction-status-info-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, MatIcon, TitleCasePipe, TranslocoPipe],
})
export class TransactionStatusInfoPopoverComponent {
  @Input() transactionStatus: ExpenseTransactionStatus;

  constructor(private popoverController: PopoverController) {}

  get TransactionStatus(): typeof ExpenseTransactionStatus {
    return ExpenseTransactionStatus;
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
