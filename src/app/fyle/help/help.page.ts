import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { from } from 'rxjs';
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Browser } from '@capacitor/browser';

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
    private trackingService: TrackingService,
    private authService: AuthService
  ) {}

  openContactSupportDialog() {
    this.contactSupportLoading = true;
    from(this.loaderService.showLoader('Please wait', 10000))
      .pipe(
        switchMap(() => from(this.authService.getEou())),
        switchMap((eou) =>
          this.orgUserService.getEmployeesByParams({
            select: 'us_full_name,us_email',
            ou_org_id: 'eq.' + eou.ou.org_id,
            ou_roles: 'like.%' + 'ADMIN%',
            ou_status: 'eq.' + '"ACTIVE"',
            ou_id: 'not.eq.' + eou.ou.id,
            order: 'us_full_name.asc,ou_id',
            limit: 5,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe((orgAdmins) => {
        this.orgAdmins = orgAdmins.data;
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
    this.trackingService.viewHelpCard();
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: this.orgAdmins,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
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

  ngOnInit() {}
}
