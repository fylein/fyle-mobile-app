import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { from } from 'rxjs';
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { OrgAdmin } from 'src/app/core/models/org-admin.model';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  orgAdmins: Partial<OrgAdmin>;

  contactSupportLoading = false;

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService,
    private trackingService: TrackingService,
    private authService: AuthService,
    private browserHandlerService: BrowserHandlerService
  ) {}

  openContactSupportDialog(): void {
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
        this.orgAdmins = orgAdmins;
        // eslint-disable-next-line no-console
        console.log('Testing New', orgAdmins);
        this.presentSupportModal('contact_support');
      });
  }

  async presentSupportModal(dialogType: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('Testing falied');
    this.trackingService.viewHelpCard();
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: this.orgAdmins,
      },
    });
    // eslint-disable-next-line no-console
    console.log('Testing falied 1');
    await modal.present();
    // eslint-disable-next-line no-console
    console.log('Testing falied 2');
    const { data }: { data?: unknown } = await modal.onDidDismiss();
    // eslint-disable-next-line no-console
    console.log('Testing 3');
    // eslint-disable-next-line no-console
    console.log('Testing 1', data);
    if (data) {
      // eslint-disable-next-line no-console
      console.log('Testing 2', data);
      if (dialogType === 'contact_support') {
        this.contactSupportLoading = false;
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Testing falied 4');
      this.contactSupportLoading = false;
    }
  }

  async openHelpLink(): Promise<void> {
    await this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://help.fylehq.com');
  }

  ngOnInit(): void {
    // Placeholder for initialization logic
    // eslint-disable-next-line no-console
    console.log('Testing orgAdmins',this.orgAdmins);
  }
}
