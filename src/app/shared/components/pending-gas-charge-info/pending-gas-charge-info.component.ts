import { Component, Input } from '@angular/core';
import { PendingGasChargeInfoModalComponent } from '../pending-gas-charge-info-modal/pending-gas-charge-info-modal.component';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-pending-gas-charge-info',
  templateUrl: './pending-gas-charge-info.component.html',
  styleUrls: ['./pending-gas-charge-info.component.scss'],
  standalone: false,
})
export class PendingGasChargeInfoComponent {
  @Input() isExpenseListView: boolean;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
  ) {}

  async openPendingGasChargeInfoModal(event: Event): Promise<void> {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: PendingGasChargeInfoModalComponent,
      ...this.modalProperties.getModalDefaultProperties('pending-gas-charge-info'),
    });

    await modal.present();
  }
}
