import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-pending-gas-charge-info-modal',
  templateUrl: './pending-gas-charge-info-modal.component.html',
  styleUrls: ['./pending-gas-charge-info-modal.component.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatIcon,
    TranslocoPipe
  ],
})
export class PendingGasChargeInfoModalComponent {
  private modalController = inject(ModalController);

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
