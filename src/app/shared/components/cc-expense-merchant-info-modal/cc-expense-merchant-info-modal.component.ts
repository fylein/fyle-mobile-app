import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-cc-expense-merchant-info',
  templateUrl: './cc-expense-merchant-info-modal.component.html',
  styleUrls: ['./cc-expense-merchant-info-modal.component.scss'],
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
export class CCExpenseMerchantInfoModalComponent {
  private modalController = inject(ModalController);

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
