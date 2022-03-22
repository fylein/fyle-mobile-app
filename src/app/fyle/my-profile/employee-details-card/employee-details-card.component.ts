import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MatTooltip } from '@angular/material/tooltip';
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
export class EmployeeDetailsCardComponent implements OnInit, AfterViewChecked {
  @ViewChild('mobileNumberRef', { read: ElementRef }) mobileNumberRef: ElementRef;

  @ViewChild('employeeIdRef', { read: ElementRef }) employeeIdRef: ElementRef;

  @Input() eou: ExtendedOrgUser;

  isMobileNumberHidden: boolean;

  isEmployeeIdHidden: boolean;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
    private orgUserService: OrgUserService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewChecked() {
    const mobileNumberEl = this.mobileNumberRef?.nativeElement;
    this.isMobileNumberHidden = mobileNumberEl && mobileNumberEl.scrollWidth > mobileNumberEl.offsetWidth;
    const employeeIdEl = this.employeeIdRef?.nativeElement;
    this.isEmployeeIdHidden = employeeIdEl && employeeIdEl.scrollWidth > employeeIdEl.offsetWidth;
    this.cdRef.detectChanges();
  }

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

  showTooltip(tooltipRef: MatTooltip) {
    tooltipRef.show();
    setTimeout(() => tooltipRef.hide(), 3000);
  }
}
