import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyOptInComponent } from '../fy-opt-in/fy-opt-in.component';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-dashboard-opt-in',
  templateUrl: './dashboard-opt-in.component.html',
  styleUrls: ['./dashboard-opt-in.component.scss'],
})
export class DashboardOptInComponent {
  @Input() extendedOrgUser: ExtendedOrgUser;

  @Output() toggleOptInBanner = new EventEmitter<{ optedIn: boolean }>();

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private trackingService: TrackingService
  ) {}

  async optInClick(): Promise<void> {
    this.trackingService.clickedOnDashboardBanner();

    const optInModal = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser: this.extendedOrgUser,
      },
    });

    await optInModal.present();

    const { data } = await optInModal.onWillDismiss<{ action: string }>();

    if (data && data.action === 'SUCCESS') {
      this.toggleOptInBanner.emit({ optedIn: true });
    }
  }

  getSkipOptInMessageBody(): string {
    return `<div>
              <p>You can't send receipts and expense details via text message if you don't opt-in.</p>
              <p>Are you sure you want to skip?<p>  
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
      this.toggleOptInBanner.emit({ optedIn: false });
    }
  }
}
