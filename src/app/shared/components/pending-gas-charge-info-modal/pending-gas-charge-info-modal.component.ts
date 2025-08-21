import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pending-gas-charge-info-modal',
  templateUrl: './pending-gas-charge-info-modal.component.html',
  styleUrls: ['./pending-gas-charge-info-modal.component.scss'],
  standalone: false,
})
export class PendingGasChargeInfoModalComponent {
  private modalController = inject(ModalController);

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
