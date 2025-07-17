import { Component, EventEmitter, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-email-opt-in',
  templateUrl: './dashboard-email-opt-in.component.html',
  styleUrls: ['./dashboard-email-opt-in.component.scss'],
})
export class DashboardEmailOptInComponent {
  @Output() toggleEmailOptInBanner = new EventEmitter<{ optedIn: boolean }>();

  constructor(
    private popoverController: PopoverController,
    private trackingService: TrackingService,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  async emailOptInClick(): Promise<void> {
    this.trackingService.clickedOnDashboardEmailOptInBanner();
    this.toggleEmailOptInBanner.emit({ optedIn: true });
    this.router.navigate([
      '/',
      'enterprise',
      'my_profile',
      {
        navigate_back: true,
        show_email_walkthrough: true,
      },
    ]);
  }

  getSkipEmailOptInMessageBody(): string {
    return this.translocoService.translate('dashboardEmailOptIn.skipEmailOptInMessage');
  }

  async skip(event: Event): Promise<void> {
    event.stopPropagation();

    const title = this.translocoService.translate('dashboardEmailOptIn.areYouSure');
    const optOutPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message: this.getSkipEmailOptInMessageBody(),
        primaryCta: {
          text: this.translocoService.translate('dashboardEmailOptIn.yesSkipEmailOptIn'),
          action: 'continue',
        },
        secondaryCta: {
          text: this.translocoService.translate('dashboardEmailOptIn.noGoBack'),
          action: 'cancel',
        },
        leftAlign: true,
      },
      cssClass: 'skip-opt-in-popover',
    });

    await optOutPopover.present();

    const { data } = await optOutPopover.onWillDismiss<{ action: string }>();

    if (data && data.action === 'continue') {
      this.toggleEmailOptInBanner.emit({ optedIn: false });
    }
  }
}
