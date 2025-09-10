import { Component, OnInit, Input, ElementRef, AfterViewInit, inject, input, viewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular/standalone';
import { finalize, switchMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { FormButtonValidationDirective } from '../../../shared/directive/form-button-validation.directive';

@Component({
  selector: 'app-update-mobile-number',
  templateUrl: './update-mobile-number.component.html',
  styleUrls: ['./update-mobile-number.component.scss'],
  imports: [IonicModule, MatIcon, MatInput, FormsModule, NgClass, FormButtonValidationDirective, TranslocoPipe],
})
export class UpdateMobileNumberComponent implements OnInit, AfterViewInit {
  private popoverController = inject(PopoverController);

  private authService = inject(AuthService);

  private orgUserService = inject(OrgUserService);

  private translocoService = inject(TranslocoService);

  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly title = input<string>(undefined);

  readonly ctaText = input<string>(undefined);

  readonly inputLabel = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() extendedOrgUser: ExtendedOrgUser;

  readonly placeholder = input<string>(undefined);

  inputValue: string;

  error: string;

  updatingMobileNumber = false;

  ngOnInit(): void {
    this.inputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl().nativeElement.focus(), 400);
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
            finalize(() => (this.updatingMobileNumber = false)),
          )
          .subscribe({
            complete: () => this.popoverController.dismiss({ action: 'SUCCESS' }),
            error: () => this.popoverController.dismiss({ action: 'ERROR' }),
          });
      }
    }
  }
}
