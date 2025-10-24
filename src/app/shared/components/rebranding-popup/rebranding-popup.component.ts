import { Component, inject, output } from '@angular/core';
import { PopoverController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-rebranding-popup',
  templateUrl: './rebranding-popup.component.html',
  styleUrls: ['./rebranding-popup.component.scss'],
  imports: [
    MatIcon,
    TranslocoPipe,
  ],
})
export class RebrandingPopupComponent {
  private popoverController = inject(PopoverController);
  private trackingService = inject(TrackingService);

  readonly popupDismissed = output<void>();

  async onLearnMoreClick(): Promise<void> {
    this.trackingService.clickedOnRebrandingLearnMore();
    window.open('https://www.fylehq.com/help/en/articles/11904708-fyle-is-now-part-of-sage-what-s-changing-and-what-s-not', '_blank');
  }

  async onOkClick(): Promise<void> {
    this.trackingService.clickedOnRebrandingOk();
    await this.popoverController.dismiss();
    this.popupDismissed.emit();
  }
}
