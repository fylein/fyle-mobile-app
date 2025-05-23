import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupportDialogPage } from 'src/app/fyle/help/support-dialog/support-dialog.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { from } from 'rxjs';
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  orgAdmins: PlatformApiResponse<Partial<Employee>[]>;

  contactSupportLoading = false;

  constructor(
    private modalController: ModalController,
    private employeesService: EmployeesService,
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
          this.employeesService.getEmployeesByParams({
            select: '(full_name,email)',
            roles: 'like.%' + 'ADMIN%',
            is_enabled: 'eq.true',
            has_accepted_invite: 'eq.true',
            id: 'neq.' + eou.ou.id,
            order: 'full_name.asc',
            limit: 5,
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe((orgAdmins) => {
        this.orgAdmins = orgAdmins;
        this.presentSupportModal('contact_support');
      });
  }

  async presentSupportModal(dialogType: string): Promise<void> {
    this.trackingService.viewHelpCard();
    const modal = await this.modalController.create({
      component: SupportDialogPage,
      componentProps: {
        type: dialogType,
        adminEous: this.orgAdmins.data,
      },
    });
    await modal.present();
    const { data }: { data?: { dismissed: boolean } } = await modal.onDidDismiss();
    if (data) {
      if (dialogType === 'contact_support') {
        this.contactSupportLoading = false;
      }
    } else {
      this.contactSupportLoading = false;
    }
  }

  async openHelpLink(): Promise<void> {
    await this.browserHandlerService.openLinkWithToolbarColor('#280a31', 'https://www.fylehq.com/help');
  }

  ngOnInit(): void {
    // Placeholder for initialization logic
  }
}
