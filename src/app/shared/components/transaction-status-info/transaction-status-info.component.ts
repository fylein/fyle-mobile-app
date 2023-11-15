import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-transaction-status-info',
  templateUrl: './transaction-status-info.component.html',
  styleUrls: ['./transaction-status-info.component.scss'],
})
export class TransactionStatusInfoComponent {
  @Input() transactionStatus: string;

  constructor(private popoverController: PopoverController) {}

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
