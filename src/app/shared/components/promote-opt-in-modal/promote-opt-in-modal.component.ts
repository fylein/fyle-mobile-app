import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyOptInComponent } from '../fy-opt-in/fy-opt-in.component';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';

@Component({
  selector: 'app-promote-opt-in-modal',
  templateUrl: './promote-opt-in-modal.component.html',
  styleUrls: ['./promote-opt-in-modal.component.scss'],
})
export class PromoteOptInModalComponent {
  @Input() extendedOrgUser: ExtendedOrgUser;

  constructor(private modalController: ModalController, private popoverController: PopoverController) {}

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
    }
  }

  getSkipOptInMessageBody(): string {
    return `<div>
              <p>You can't send receipts and expense details via text message if you don't opt-in.</p>
              <p>Are you sure you want to skip?</p>  
            </div>`;
  }

  async skip(): Promise<void> {
    const optOutPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Are you sure?',
        message: this.getSkipOptInMessageBody(),
        primaryCta: {
          text: 'Yes, skip opt-in',
          action: 'continue',
        },
        secondaryCta: {
          text: 'No, go back',
          action: 'cancel',
        },
      },
      cssClass: 'skip-opt-in-popover',
    });

    await optOutPopover.present();

    const { data } = await optOutPopover.onWillDismiss<{ action: string }>();

    if (data && data.action === 'continue') {
      this.modalController.dismiss({ skipOptIn: true });
    }
  }
}
