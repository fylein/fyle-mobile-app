import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-budget-total-utilisation-info-modal',
  templateUrl: './budget-total-utilisation-info-modal.component.html',
  styleUrls: ['./budget-total-utilisation-info-modal.component.scss'],
  imports: [IonButton, IonButtons, IonHeader, IonTitle, IonToolbar, MatIcon, TranslocoPipe],
})
export class BudgetTotalUtilisationInfoModalComponent {
  private modalController = inject(ModalController);

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
