import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyOptInComponent } from '../fy-opt-in/fy-opt-in.component';

@Component({
  selector: 'app-promote-opt-in-modal',
  templateUrl: './promote-opt-in-modal.component.html',
  styleUrls: ['./promote-opt-in-modal.component.scss'],
})
export class PromoteOptInModalComponent {
  @Input() extendedOrgUser: ExtendedOrgUser;

  constructor(private modalController: ModalController) {}

  async optInClick(): Promise<void> {
    const optInModal = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser: this.extendedOrgUser,
      },
    });

    await optInModal.present();

    const { data } = await optInModal.onDidDismiss<{ action: string }>();

    if (data && data.action === 'SUCCESS') {
      this.modalController.dismiss({ skipOptIn: false });
    } else {
      this.modalController.dismiss({ skipOptIn: true });
    }
  }

  skip(): void {
    this.modalController.dismiss({ skipOptIn: true });
  }
}
