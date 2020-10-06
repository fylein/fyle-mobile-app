import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { Browser } =  Plugins;

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
  ) { }

  openHelpLink() {
    // TODO: add tracking service to track engagement with help card event (source old mobile app)
    Browser.open({ toolbarColor: '#280a31', url: 'https://fylehq.com/help/' });
  }

  openChromeExtLink() {
    // TODO: add tracking service to track engagement with help card event (source old mobile app)
    Browser.open({ toolbarColor: '#280a31', url: 'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk' });
  }

  openOutlookExtLink() {
    // TODO: add tracking service to track engagement with help card event (source old mobile app)
    Browser.open({ toolbarColor: '#280a31', url: 'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview' });
  }

  openIbiboLink() {
    // TODO: add tracking service to track engagement with help card event (source old mobile app)
    Browser.open({ toolbarColor: '#280a31', url: 'https://medium.com/@Dhinesh/travel-reimbursements-just-one-tap-away-for-gobiz-users-2ca6f4667e21' });
  }

  closeDialog() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
  ngOnInit() {
  }
}
