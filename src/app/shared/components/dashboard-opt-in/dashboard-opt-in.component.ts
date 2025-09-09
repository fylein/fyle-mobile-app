import { Component, inject, input, output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyOptInComponent } from '../fy-opt-in/fy-opt-in.component';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard-opt-in',
    templateUrl: './dashboard-opt-in.component.html',
    styleUrls: ['./dashboard-opt-in.component.scss'],
    imports: [MatIcon, TranslocoPipe],
})
export class DashboardOptInComponent {
  private modalController = inject(ModalController);

  private popoverController = inject(PopoverController);

  private trackingService = inject(TrackingService);

  private translocoService = inject(TranslocoService);

  readonly extendedOrgUser = input<ExtendedOrgUser>(undefined);

  readonly toggleOptInBanner = output<{
    optedIn: boolean;
  }>();

  async optInClick(): Promise<void> {
    this.trackingService.clickedOnDashboardBanner();

    const optInModal = await this.modalController.create({
      component: FyOptInComponent,
      componentProps: {
        extendedOrgUser: this.extendedOrgUser(),
      },
    });

    await optInModal.present();

    const { data } = await optInModal.onWillDismiss<{ action: string }>();

    if (data && data.action === 'SUCCESS') {
      this.toggleOptInBanner.emit({ optedIn: true });
    }
  }

  getSkipOptInMessageBody(): string {
    return this.translocoService.translate('dashboardOptIn.skipOptInMessage');
  }

  async skip(event: Event): Promise<void> {
    event.stopPropagation();

    const title = this.translocoService.translate('dashboardOptIn.areYouSure');
    const optOutPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message: this.getSkipOptInMessageBody(),
        primaryCta: {
          text: this.translocoService.translate('dashboardOptIn.yesSkipOptIn'),
          action: 'continue',
        },
        secondaryCta: {
          text: this.translocoService.translate('dashboardOptIn.noGoBack'),
          action: 'cancel',
        },
        leftAlign: true,
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
