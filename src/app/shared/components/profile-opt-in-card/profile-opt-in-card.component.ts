import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-profile-opt-in-card',
  templateUrl: './profile-opt-in-card.component.html',
  styleUrls: ['./profile-opt-in-card.component.scss'],
})
export class ProfileOptInCardComponent implements OnInit {
  @Input() extendedOrgUser: ExtendedOrgUser;

  @Input() employee: PlatformEmployee;

  @Input() optOutSource: 'SMS' | 'WEBAPP' | null;

  @Output() copiedText = new EventEmitter<string>();

  @Output() optInClicked = new EventEmitter<ExtendedOrgUser>();

  @Output() optOutClicked = new EventEmitter<void>();

  @Output() editMobileNumberClicked = new EventEmitter<ExtendedOrgUser>();

  @Output() deleteMobileNumberClicked = new EventEmitter<void>();

  isUserOptedIn = false;

  isMobileAddedButNotVerified = false;

  isInvalidUSNumber = false;

  mobileNumber: string;

  constructor(
    private clipboardService: ClipboardService,
    private trackingService: TrackingService,
    private employeesService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.isUserOptedIn = this.extendedOrgUser.ou.mobile && this.extendedOrgUser.ou.mobile_verified;
    this.mobileNumber = this.extendedOrgUser.ou.mobile;
    this.isMobileAddedButNotVerified = this.extendedOrgUser.ou.mobile && !this.extendedOrgUser.ou.mobile_verified;
    this.isInvalidUSNumber = this.isMobileAddedButNotVerified && !this.extendedOrgUser.ou.mobile.startsWith('+1');
    this.employeesService.getByParams({ user_id: `eq.${this.extendedOrgUser.ou.user_id}` }).subscribe((res) => {
      this.employee = res.data[0];
      this.optOutSource = this.employee.sms_opt_out_source;
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
    this.optOutClicked.emit();
  }

  editMobileNumber(): void {
    this.trackingService.clickedOnEditNumber();
    this.editMobileNumberClicked.emit(this.extendedOrgUser);
  }

  deleteMobileNumber(): void {
    this.trackingService.clickedOnDeleteNumber();
    this.deleteMobileNumberClicked.emit();
  }

  async copyToClipboard(): Promise<void> {
    await this.clipboardService.writeString('(302) 440-2921');
    this.copiedText.emit('Phone Number Copied Successfully');
  }
}
