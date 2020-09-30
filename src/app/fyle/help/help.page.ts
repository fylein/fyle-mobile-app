import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { ExtendedOrgUsersService } from 'src/app/core/services/extended-org-users.service';
import { Plugins } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';

const { Browser } =  Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private extendedOrgUserService: ExtendedOrgUsersService,
    private loadingController: LoadingController
    ) { }

  openContactSupportDialog() {
    this.presentLoading();
    // getting admins list, required for contact support modal
    let orgAdmins = [];
    this.extendedOrgUserService.getAllCompanyEouc().subscribe(user => {
      orgAdmins = user.filter(user =>
        user.ou.roles.indexOf('ADMIN') > -1 && user.ou.status === 'ACTIVE'
      );
      this.loadingController.dismiss();
      // only need to display 5 admins, so spliced 5
      this.presentSupportModal('contact_support', orgAdmins.splice(0, 5));
    });
  }

  async presentLoading() {
    // TODO: to replace with new loader, suggested to create component
    const loading = await this.loadingController.create({
    });
    await loading.present();
  }

  openLogMileageDialog() {
    this.presentSupportModal('log_mileage', '');
  }

  openCaptureEmailReceiptsDialog() {
    this.presentSupportModal('capture_email', '');
  }

  openManageGoIbiboBookingsDialog() {
    this.presentSupportModal('goibibo_support', '');
  }

  async presentSupportModal(dialogType, orgAdmins) {
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: orgAdmins
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
