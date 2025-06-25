import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { finalize, switchMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-update-mobile-number',
  templateUrl: './update-mobile-number.component.html',
  styleUrls: ['./update-mobile-number.component.scss'],
})
export class UpdateMobileNumberComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputEl: ElementRef<HTMLInputElement>;

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
    private orgUserService: OrgUserService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.inputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  validateInput(): void {
    if (!this.inputValue?.length) {
      this.error = this.translocoService.translate('updateMobileNumber.errorEnterNumber');
    } else if (!this.inputValue.match(/[+]\d{7,}$/)) {
      this.error = this.translocoService.translate('updateMobileNumber.errorEnterNumberWithCountryCode');
    }
  }

  onFocus(): void {
    this.error = null;
  }

  saveValue(): void {
    //If user has not changed the verified mobile number, close the popover
    if (this.inputValue && this.inputValue === this.extendedOrgUser.ou.mobile) {
      this.popoverController.dismiss();
    } else {
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
}
