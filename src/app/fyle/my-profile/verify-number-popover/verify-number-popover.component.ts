import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { noop } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-verify-number-popover',
  templateUrl: './verify-number-popover.component.html',
  styleUrls: ['./verify-number-popover.component.scss'],
})
export class VerifyNumberPopoverComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputEl: ElementRef;

  @Input() extendedOrgUser: ExtendedOrgUser;

  value: string;

  infoBoxText: string;

  sendingOtp = false;

  verifyingOtp = false;

  error = '';

  constructor(private popoverController: PopoverController, private apiService: ApiService) {}

  ngOnInit(): void {
    this.infoBoxText = `Please verify your mobile number using the 6-digit OTP sent to ${this.extendedOrgUser.ou.mobile}`;
    this.resendOtp();
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  validateInput() {
    if (!this.value || this.value.length < 6 || !this.value.match(/[0-9]{6}/)) {
      this.error = 'Please enter 6 digit OTP';
    }
  }

  goBack() {
    this.popoverController.dismiss({ action: 'BACK' });
  }

  onFocus() {
    this.error = null;
  }

  resendOtp() {
    //TODO: Restrict this to 5 times a day
    this.sendingOtp = true;
    this.apiService
      .post('/orgusers/verify_mobile')
      .pipe(finalize(() => (this.sendingOtp = false)))
      .subscribe(noop);
  }

  verifyOtp() {
    this.validateInput();
    if (!this.error) {
      this.verifyingOtp = true;
      this.apiService
        .post('/orgusers/check_mobile_verification_code', this.value)
        .pipe(finalize(() => (this.verifyingOtp = false)))
        .subscribe({
          complete: () => this.popoverController.dismiss({ action: 'SUCCESS' }),
          error: () => (this.error = 'Incorrect mobile number or OTP. Please try again.'),
        });
    }
  }
}
