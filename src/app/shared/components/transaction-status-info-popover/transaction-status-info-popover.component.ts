import { Component, inject, input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { MatIcon } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-transaction-status-info-popover',
    templateUrl: './transaction-status-info-popover.component.html',
    styleUrls: ['./transaction-status-info-popover.component.scss'],
    imports: [
        IonicModule,
        MatIcon,
        TitleCasePipe,
        TranslocoPipe,
    ],
})
export class TransactionStatusInfoPopoverComponent {
  private popoverController = inject(PopoverController);

  readonly transactionStatus = input<ExpenseTransactionStatus>(undefined);

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
