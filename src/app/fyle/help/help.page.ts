import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { Browser } from '@capacitor/browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { filter, tap, map, switchMap, finalize, take } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { from, of } from 'rxjs';
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';

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
    private authService: AuthService,
    private browserHandlerService: BrowserHandlerService
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
    this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://help.fylehq.com');
  }

  ngOnInit() {}
}
