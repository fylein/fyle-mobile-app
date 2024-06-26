import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-profile-opt-in-card',
  templateUrl: './profile-opt-in-card.component.html',
  styleUrls: ['./profile-opt-in-card.component.scss'],
})
export class ProfileOptInCardComponent implements OnInit {
  @Input() extendedOrgUser: ExtendedOrgUser;

  @Output() copiedText = new EventEmitter<string>();

  @Output() optInClicked = new EventEmitter<ExtendedOrgUser>();

  @Output() optOutClicked = new EventEmitter<void>();

  @Output() editMobileNumberClicked = new EventEmitter<ExtendedOrgUser>();

  isUserOptedIn = false;

  mobileNumber: string;

  constructor(private clipboardService: ClipboardService, private trackingService: TrackingService) {}

  ngOnInit(): void {
    this.isUserOptedIn = this.extendedOrgUser.ou.mobile && this.extendedOrgUser.ou.mobile_verified;
    this.mobileNumber = this.extendedOrgUser.ou.mobile;
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

  async copyToClipboard(): Promise<void> {
    await this.clipboardService.writeString('(302) 440-2921');
    this.copiedText.emit('Phone Number Copied Successfully');
  }
}
