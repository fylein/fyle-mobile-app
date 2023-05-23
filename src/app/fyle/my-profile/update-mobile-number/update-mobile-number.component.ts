import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { finalize, switchMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';

@Component({
  selector: 'app-update-mobile-number',
  templateUrl: './update-mobile-number.component.html',
  styleUrls: ['./update-mobile-number.component.scss'],
})
export class UpdateMobileNumberComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputEl: ElementRef;

  @Input() title: string;

  @Input() ctaText: string;

  @Input() inputLabel: string;

  @Input() extendedOrgUser: ExtendedOrgUser;

  @Input() placeholder: string;

  inputValue: string;

  error: string;

  updatingMobileNumber = false;

  constructor(
    private popoverController: PopoverController,
    private authService: AuthService,
    private orgUserService: OrgUserService
  ) {}

  ngOnInit(): void {
    this.inputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  closePopover() {
    this.popoverController.dismiss();
  }

  validateInput() {
    if (this.inputValue?.length === 0) {
      this.error = 'Please enter a Mobile Number';
    } else if (!this.inputValue.match(/[+]\d{7,}$/)) {
      this.error = 'Please enter a valid mobile number with country code. e.g. +12025559975';
    }
  }

  onFocus() {
    this.error = null;
  }

  saveValue() {
    this.validateInput();
    if (!this.error?.length) {
      this.updatingMobileNumber = true;

      const updatedOrgUserDetails = {
        ...this.extendedOrgUser.ou,
        mobile: this.inputValue,
      };
      this.orgUserService
        .postOrgUser(updatedOrgUserDetails)
        .pipe(
          switchMap(() => this.authService.refreshEou()),
          finalize(() => (this.updatingMobileNumber = false))
        )
        .subscribe({
          complete: () => this.popoverController.dismiss({ action: 'SUCCESS' }),
          error: () => this.popoverController.dismiss({ action: 'ERROR' }),
        });
    }
  }
}
