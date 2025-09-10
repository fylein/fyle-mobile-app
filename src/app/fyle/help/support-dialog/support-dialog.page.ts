import { Component, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { NavParams } from '@ionic/angular/standalone';
import { TrackingService } from '../../../core/services/tracking.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { HelpAdminInfo } from 'src/app/core/models/help-admin-info.model';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-support-dialog',
  templateUrl: './support-dialog.page.html',
  styleUrls: ['./support-dialog.page.scss'],
  imports: [IonicModule, MatIcon],
})
export class SupportDialogPage {
  private modalController = inject(ModalController);

  private navParams = inject(NavParams);

  private trackingService = inject(TrackingService);

  private browserHandlerService = inject(BrowserHandlerService);

  readonly adminEous = input<HelpAdminInfo[]>([]);

  dialogType = this.navParams.get<string>('type');

  adminList = this.navParams.get<HelpAdminInfo[]>('adminEous');

  async openHelpLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://www.fylehq.com/help');
  }

  async openChromeExtLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk',
    );
  }

  async openOutlookExtLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview',
    );
  }

  closeDialog(): void {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
