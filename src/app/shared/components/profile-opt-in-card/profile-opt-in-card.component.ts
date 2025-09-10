import { Component, Input, OnInit, inject, output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-profile-opt-in-card',
  templateUrl: './profile-opt-in-card.component.html',
  styleUrls: ['./profile-opt-in-card.component.scss'],
  imports: [IonicModule, TranslocoPipe],
})
export class ProfileOptInCardComponent implements OnInit {
  private clipboardService = inject(ClipboardService);

  private trackingService = inject(TrackingService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() extendedOrgUser: ExtendedOrgUser;

  readonly copiedText = output<string>();

  readonly optInClicked = output<ExtendedOrgUser>();

  readonly optOutClicked = output<void>();

  readonly editMobileNumberClicked = output<ExtendedOrgUser>();

  readonly deleteMobileNumberClicked = output<void>();

  isUserOptedIn = false;

  isMobileAddedButNotVerified = false;

  isInvalidUSNumber = false;

  mobileNumber: string;

  ngOnInit(): void {
    this.isUserOptedIn = this.extendedOrgUser.ou.mobile && this.extendedOrgUser.ou.mobile_verified;
    this.mobileNumber = this.extendedOrgUser.ou.mobile;
    this.isMobileAddedButNotVerified = this.extendedOrgUser.ou.mobile && !this.extendedOrgUser.ou.mobile_verified;
    this.isInvalidUSNumber = this.isMobileAddedButNotVerified && !this.extendedOrgUser.ou.mobile.startsWith('+1');
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
