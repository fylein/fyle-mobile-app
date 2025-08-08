import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pending-gas-charge-info-modal',
  templateUrl: './pending-gas-charge-info-modal.component.html',
  styleUrls: ['./pending-gas-charge-info-modal.component.scss'],
  standalone: false,
})
export class PendingGasChargeInfoModalComponent {
  constructor(private modalController: ModalController) {}

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
