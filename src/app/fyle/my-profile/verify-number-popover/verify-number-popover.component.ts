import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { ErrorType } from './error-type.model';

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

  showOtpTimer = false;

  otpTimer: number;

  disableResendOtp = false;

  constructor(
    private popoverController: PopoverController,
    private mobileNumberVerificationService: MobileNumberVerificationService
  ) {}

  ngOnInit(): void {
    this.infoBoxText = `Please verify your mobile number using the 6-digit OTP sent to ${this.extendedOrgUser.ou.mobile}`;
    this.value = '';
    this.resendOtp('INITIAL');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.error) {
        this.inputEl.nativeElement.focus();
      }
    }, 200);
  }

  validateInput() {
    if (!this.value || this.value.length < 6 || !this.value.match(/[0-9]{6}/)) {
      this.setError('INVALID_INPUT');
    }
  }

  goBack() {
    this.popoverController.dismiss({ action: 'BACK' });
  }

  onFocus() {
    this.error = null;
  }

  resendOtp(action: 'CLICK' | 'INITIAL') {
    this.sendingOtp = true;
    this.mobileNumberVerificationService
      .sendOtp()
      .pipe(finalize(() => (this.sendingOtp = false)))
      .subscribe({
        next: (otpDetails) => {
          const attemptsLeft = otpDetails.attempts_left;

          if (attemptsLeft > 0) {
            if (action === 'CLICK') {
              this.setError('ATTEMPTS_LEFT', attemptsLeft);
              this.startTimer();
            }
          } else {
            this.setError('LIMIT_REACHED');
            this.disableResendOtp = true;
          }
        },
        error: (err) => {
          if (err.status === 400) {
            const errorMessage = err.error.message?.toLowerCase() || '';
            if (errorMessage.includes('out of attempts') || errorMessage.includes('max send attempts reached')) {
              this.setError('LIMIT_REACHED');
              this.disableResendOtp = true;
            } else if (errorMessage.includes('invalid parameter')) {
              this.setError('INVALID_MOBILE_NUMBER');
            } else {
              this.setError('INVALID_OTP');
            }
          }
        },
      });
  }

  verifyOtp() {
    this.validateInput();
    if (this.error) {
      return;
    }
    this.verifyingOtp = true;
    this.mobileNumberVerificationService
      .verifyOtp(this.value)
      .pipe(finalize(() => (this.verifyingOtp = false)))
      .subscribe({
        complete: () => this.popoverController.dismiss({ action: 'SUCCESS' }),
        error: () => this.setError('INVALID_OTP'),
      });
  }

  setError(error: ErrorType, attemptsLeft = 5) {
    const errorMapping = {
      LIMIT_REACHED:
        'You have exhausted the limit to request OTP for your mobile number. Please try again after 24 hours.',
      INVALID_MOBILE_NUMBER: 'Invalid mobile number. Please try again',
      INVALID_OTP: 'Incorrect mobile number or OTP. Please try again.',
      INVALID_INPUT: 'Please enter 6 digit OTP',
      ATTEMPTS_LEFT: `You have ${attemptsLeft} attempt${
        attemptsLeft > 1 ? 's' : ''
      } left to verify your mobile number.`,
    };

    this.error = errorMapping[error];
  }

  startTimer() {
    this.otpTimer = 30;
    this.showOtpTimer = true;
    const interval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer === 0) {
        clearInterval(interval);
        this.showOtpTimer = false;
      }
    }, 1000);
  }
}
