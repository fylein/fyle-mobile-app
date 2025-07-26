import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { TrackingService } from '../../../core/services/tracking.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { HelpAdminInfo } from 'src/app/core/models/help-admin-info.model';

@Component({
  selector: 'app-support-dialog',
  templateUrl: './support-dialog.page.html',
  styleUrls: ['./support-dialog.page.scss'],
  standalone: false,
})
export class SupportDialogPage {
  @Input() adminEous: HelpAdminInfo[] = [];

  dialogType = this.navParams.get<string>('type');

  adminList = this.navParams.get<HelpAdminInfo[]>('adminEous');

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private trackingService: TrackingService,
    private browserHandlerService: BrowserHandlerService
  ) {}

  async openHelpLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://www.fylehq.com/help');
  }

  async openChromeExtLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk'
    );
  }

  async openOutlookExtLink(): Promise<void> {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview'
    );
  }

  closeDialog(): void {
    this.modalController.dismiss({
      dismissed: true,
    });
  }
}
