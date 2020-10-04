import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { Plugins } from '@capacitor/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { filter, tap, map } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';

const { Browser } =  Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  pageTitle = 'Help';
  orgAdmins;

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService
    ) { }

  openContactSupportDialog() {
    this.loaderService.showLoader('Please wait');
    // getting admins list, required for contact support modal
    this.orgUserService.getAllCompanyEouc().pipe(
      map(user =>
        {
          this.orgAdmins = user.filter(user => user.ou.roles.indexOf('ADMIN') > -1 && user.ou.status === 'ACTIVE');
        }
      )
    ).subscribe(() => {
      this.loaderService.hideLoader();
      this.presentSupportModal('contact_support');
    });
  }

  openLogMileageDialog() {
    this.presentSupportModal('log_mileage');
  }

  openCaptureEmailReceiptsDialog() {
    this.presentSupportModal('capture_email');
  }

  openManageGoIbiboBookingsDialog() {
    this.presentSupportModal('goibibo_support');
  }

  async presentSupportModal(dialogType) {
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: this.orgAdmins && this.orgAdmins.splice(0, 5) || []
      }
    });
    return await modal.present();
  }

  openHelpLink() {
    Browser.open({ toolbarColor: '#280a31', url: 'https://fylehq.com/help/' });
  }

  ngOnInit() {
  }

}
