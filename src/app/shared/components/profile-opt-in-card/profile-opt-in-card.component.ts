import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-opt-in-card',
  templateUrl: './profile-opt-in-card.component.html',
  styleUrls: ['./profile-opt-in-card.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoPipe],
})
export class ProfileOptInCardComponent implements OnInit {
  @Input() extendedOrgUser: ExtendedOrgUser;

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
    private translocoService: TranslocoService
  ) {}

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
    this.copiedText.emit(this.translocoService.translate('profileOptInCard.copySuccess'));
  }
}
