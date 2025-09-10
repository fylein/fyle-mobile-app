import { Component, inject, output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-email-opt-in',
  templateUrl: './dashboard-email-opt-in.component.html',
  styleUrls: ['./dashboard-email-opt-in.component.scss'],
  imports: [MatIcon, TranslocoPipe],
})
export class DashboardEmailOptInComponent {
  private popoverController = inject(PopoverController);

  private trackingService = inject(TrackingService);

  private router = inject(Router);

  private translocoService = inject(TranslocoService);

  readonly toggleEmailOptInBanner = output<{
    optedIn: boolean;
  }>();

  async emailOptInClick(): Promise<void> {
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
