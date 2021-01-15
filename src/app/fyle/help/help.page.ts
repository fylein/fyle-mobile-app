import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { Plugins } from '@capacitor/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { filter, tap, map, switchMap, finalize, take } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { from, of } from 'rxjs';
import {TrackingService} from '../../core/services/tracking.service';

const { Browser } =  Plugins;

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  orgAdmins;
  contactSupportLoading = false;

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService,
    private trackingService: TrackingService
    ) { }

  openContactSupportDialog() {
    this.contactSupportLoading = true;
    from(this.loaderService.showLoader('Please wait')).pipe(
      switchMap(() => {
        return this.orgUserService.getAllCompanyEouc();
      }),
      map(user =>
        {
          return user.filter(userInternal => userInternal.ou.roles.indexOf('ADMIN') > -1 && userInternal.ou.status === 'ACTIVE');
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
    this.trackingService.viewHelpCard({Asset: 'Mobile'});
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: this.orgAdmins && this.orgAdmins.splice(0, 5) || []
      }
    });

    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data) {
      if (dialogType === 'contact_support') {
        this.contactSupportLoading = false;
      }
    } else {
      this.contactSupportLoading = false;
    }
  }

  openHelpLink() {
    Browser.open({ toolbarColor: '#280a31', url: 'https://fylehq.com/help/' });
  }

  ngOnInit() {
  }

}
