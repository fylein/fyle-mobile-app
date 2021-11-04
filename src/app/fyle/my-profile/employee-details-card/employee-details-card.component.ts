import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { noop } from 'rxjs';
import { map, tap, concatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { FyInputPopoverComponent } from 'src/app/shared/components/fy-input-popover/fy-input-popover.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';

@Component({
  selector: 'app-employee-details-card',
  templateUrl: './employee-details-card.component.html',
  styleUrls: ['./employee-details-card.component.scss'],
})
export class EmployeeDetailsCardComponent implements OnInit {
  @Input() eou: ExtendedOrgUser;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
    private orgUserService: OrgUserService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ngOnInit(): void {}

  async updateMobileNumber() {
    const updateMobileNumberPopover = await this.popoverController.create({
      component: FyInputPopoverComponent,
      componentProps: {
        title: (this.eou.ou.mobile?.length ? 'Edit' : 'Add') + ' Mobile Number',
        ctaText: 'Save',
        inputLabel: 'Mobile Number',
        inputValue: this.eou.ou.mobile,
        inputType: 'tel',
      },
      cssClass: 'fy-dialog-popover',
    });

    await updateMobileNumberPopover.present();
    const { data } = await updateMobileNumberPopover.onWillDismiss();

    if (data && data.newValue) {
      this.eou.ou.mobile = data.newValue;
      this.orgUserService
        .postOrgUser(this.eou.ou)
        .pipe(
          concatMap(() =>
            this.authService.refreshEou().pipe(
              tap(() => this.trackingService.activated()),
              map(() => {
                const message = 'Profile saved successfully';
                this.matSnackBar.openFromComponent(ToastMessageComponent, {
                  ...this.snackbarProperties.setSnackbarProperties('success', { message }),
                  panelClass: ['msb-success'],
                });
                this.trackingService.showToastMessage({ ToastContent: message });
              })
            )
          )
        )
        .subscribe(noop);
    }
  }
}
