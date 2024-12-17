import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-cc-expense-merchant-info',
  templateUrl: './cc-expense-merchant-info-popover.component.html',
  styleUrls: ['./cc-expense-merchant-info-popover.component.scss'],
})
export class CcExpenseMerchantInfoPopoverComponent {
  constructor(private popoverController: PopoverController) {}

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
