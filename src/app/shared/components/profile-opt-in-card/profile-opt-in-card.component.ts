import { Component, Input, OnInit, inject, output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { IonIcon } from '@ionic/angular/standalone';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';


@Component({
  selector: 'app-profile-opt-in-card',
  templateUrl: './profile-opt-in-card.component.html',
  styleUrls: ['./profile-opt-in-card.component.scss'],
  imports: [
    IonIcon,
    TranslocoPipe,
    FyAlertInfoComponent
  ],
})
export class ProfileOptInCardComponent implements OnInit {
  private clipboardService = inject(ClipboardService);

  private trackingService = inject(TrackingService);

  private employeesService = inject(EmployeesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() extendedOrgUser: ExtendedOrgUser;

  readonly copiedText = output<string>();

  readonly optInClicked = output<ExtendedOrgUser>();

  readonly optOutClicked = output<void>();

  readonly editMobileNumberClicked = output<ExtendedOrgUser>();

  readonly deleteMobileNumberClicked = output<void>();

  employee: PlatformEmployee;

  isOptedOutViaSms = false;

  isUserOptedIn = false;

  isMobileAddedButNotVerified = false;

  isInvalidUSNumber = false;

  mobileNumber: string;

  ngOnInit(): void {
    this.employeesService.getByParams({ user_id: `eq.${this.extendedOrgUser.ou.user_id}` }).subscribe((res) => {
      this.employee = res.data[0];
      this.mobileNumber = this.employee.mobile;
      this.isMobileAddedButNotVerified = this.mobileNumber && !this.employee.is_mobile_verified;
      this.isInvalidUSNumber = this.isMobileAddedButNotVerified && !this.mobileNumber.startsWith('+1');
      this.isUserOptedIn = this.mobileNumber && this.employee.is_mobile_verified;
      this.isOptedOutViaSms = this.employee.sms_opt_out_source === 'SMS';
    });
  }

  clickedOnOptIn(): void {
    if (!this.isUserOptedIn) {
      this.trackingService.clickedOptInFromProfile();
      this.optInClicked.emit(this.extendedOrgUser);
    }
  }

  clickedOnOptOut(): void {
    this.trackingService.clickedOnOptOut();
    // TODO: The 'emit' function requires a mandatory void argument
    this.optOutClicked.emit();
  }

  editMobileNumber(): void {
    this.trackingService.clickedOnEditNumber();
    this.editMobileNumberClicked.emit(this.extendedOrgUser);
  }

  deleteMobileNumber(): void {
    this.trackingService.clickedOnDeleteNumber();
    // TODO: The 'emit' function requires a mandatory void argument
    this.deleteMobileNumberClicked.emit();
  }

  async copyToClipboard(): Promise<void> {
    await this.clipboardService.writeString('(302) 440-2921');
    this.copiedText.emit(this.translocoService.translate('profileOptInCard.copySuccess'));
  }
}
