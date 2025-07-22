import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-cc-expense-merchant-info',
  templateUrl: './cc-expense-merchant-info-modal.component.html',
  styleUrls: ['./cc-expense-merchant-info-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, MatIcon, TranslocoPipe],
})
export class CCExpenseMerchantInfoModalComponent {
  constructor(private modalController: ModalController) {}

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
