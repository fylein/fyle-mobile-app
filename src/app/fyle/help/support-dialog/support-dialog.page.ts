import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { TrackingService } from '../../../core/services/tracking.service';

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
    private trackingService: TrackingService
  ) {}

  openHelpLink() {
    this.trackingService.engageWithHelpCard();
    Browser.open({ toolbarColor: '#280a31', url: 'https://help.fylehq.com' });
  }

  openChromeExtLink() {
    this.trackingService.engageWithHelpCard();
    Browser.open({
      toolbarColor: '#280a31',
      url: 'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk',
    });
  }

  openOutlookExtLink() {
    this.trackingService.engageWithHelpCard();
    Browser.open({
      toolbarColor: '#280a31',
      url: 'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview',
    });
  }

  closeDialog() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  ngOnInit() {}
}
