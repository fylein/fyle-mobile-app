import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { Plugins } from '@capacitor/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { filter, tap, map, switchMap, finalize, take } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { from, of } from 'rxjs';

const { Browser } =  Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  orgAdmins;

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService
    ) { }

  openContactSupportDialog() {
    from(this.loaderService.showLoader('Please wait')).pipe(
      switchMap(() => {
        return this.orgUserService.getAllCompanyEouc();
      }),
      map(user =>
        {
          return user.filter(user => user.ou.roles.indexOf('ADMIN') > -1 && user.ou.status === 'ACTIVE');
        }
      ),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe((orgAdmins) => {
      this.orgAdmins = orgAdmins;
      this.presentSupportModal('contact_support');
    });
  }

  openLogMileageDialog() {
    this.presentSupportModal('log_mileage');
  }

  openCaptureEmailReceiptsDialog() {
    this.presentSupportModal('capture_email');
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
