import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cc-expense-merchant-info',
  templateUrl: './cc-expense-merchant-info-modal.component.html',
  styleUrls: ['./cc-expense-merchant-info-modal.component.scss'],
  standalone: false,
})
export class CCExpenseMerchantInfoModalComponent {
  constructor(private modalController: ModalController) {}

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
