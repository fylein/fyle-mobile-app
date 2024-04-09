import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { TrackingService } from '../../../core/services/tracking.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';

@Component({
  selector: 'app-support-dialog',
  templateUrl: './support-dialog.page.html',
  styleUrls: ['./support-dialog.page.scss'],
})
export class SupportDialogPage implements OnInit {
  @Input() adminEous: [];

  dialogType = this.navParams.get('type');

  adminList = this.navParams.get('adminEous');

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private trackingService: TrackingService,
    private browserHandlerService: BrowserHandlerService
  ) {}

  async openHelpLink() {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://help.fylehq.com');
  }

  async openChromeExtLink() {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk'
    );
  }

  async openOutlookExtLink() {
    this.trackingService.engageWithHelpCard();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview'
    );
  }

  closeDialog() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  ngOnInit() {}
}
