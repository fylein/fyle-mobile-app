import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TransactionStatus } from 'src/app/core/models/platform/v1/expense.model';

@Component({
  selector: 'app-transaction-status-info-popover',
  templateUrl: './transaction-status-info-popover.component.html',
  styleUrls: ['./transaction-status-info-popover.component.scss'],
})
export class TransactionStatusInfoPopoverComponent {
  @Input() transactionStatus: TransactionStatus;

  constructor(private popoverController: PopoverController) {}

  get TransactionStatus(): typeof TransactionStatus {
    return TransactionStatus;
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
