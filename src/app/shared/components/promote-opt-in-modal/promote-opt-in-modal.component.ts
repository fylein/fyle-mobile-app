import { Component, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyOptInComponent } from '../fy-opt-in/fy-opt-in.component';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-promote-opt-in-modal',
  templateUrl: './promote-opt-in-modal.component.html',
  styleUrls: ['./promote-opt-in-modal.component.scss'],
  standalone: false,
})
export class PromoteOptInModalComponent {
  @Input() extendedOrgUser: ExtendedOrgUser;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private translocoService: TranslocoService
  ) {}

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
    return this.translocoService.translate('promoteOptInModal.skipMessageBody');
  }

  async skip(): Promise<void> {
    const title = this.translocoService.translate('promoteOptInModal.areYouSure');
    const optOutPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message: this.getSkipOptInMessageBody(),
        primaryCta: {
          text: this.translocoService.translate('promoteOptInModal.yesSkipOptIn'),
          action: 'continue',
        },
        secondaryCta: {
          text: this.translocoService.translate('promoteOptInModal.noGoBack'),
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
