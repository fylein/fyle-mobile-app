import { Component, OnInit, Input, ElementRef, AfterViewInit, inject, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { ErrorType } from './error-type.model';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-verify-number-popover',
  templateUrl: './verify-number-popover.component.html',
  styleUrls: ['./verify-number-popover.component.scss'],
  standalone: false,
})
export class VerifyNumberPopoverComponent implements OnInit, AfterViewInit {
  private popoverController = inject(PopoverController);

  private mobileNumberVerificationService = inject(MobileNumberVerificationService);

  private translocoService = inject(TranslocoService);

  @ViewChild('input') inputEl: ElementRef<HTMLInputElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() extendedOrgUser: ExtendedOrgUser;

  value: string;

  infoBoxText: string;

  sendingOtp = false;

  verifyingOtp = false;

  error = '';

  showOtpTimer = false;

  otpTimer: number;

  disableResendOtp = false;

  ngOnInit(): void {
    this.infoBoxText = this.translocoService.translate('verifyNumberPopover.infoBoxText', {
      mobileNumber: this.extendedOrgUser.ou.mobile,
    });
    this.value = '';
    this.resendOtp('INITIAL');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.error) {
        this.inputEl.nativeElement.focus();
      }
    }, 200);
  }

  validateInput(): void {
    if (!this.value || this.value.length < 6 || !this.value.match(/[0-9]{6}/)) {
      this.setError('INVALID_INPUT');
    }
  }

  goBack(): void {
    this.popoverController.dismiss({ action: 'BACK' });
  }

  onFocus(): void {
    this.error = null;
  }

  resendOtp(action: 'CLICK' | 'INITIAL'): void {
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
            }
            this.startTimer();
          } else {
            this.setError('LIMIT_REACHED');
            this.disableResendOtp = true;
          }
        },
        error: (err: { status: number; error: { message: string } }) => {
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

  verifyOtp(): void {
    this.validateInput();
    if (this.error) {
      return;
    }
    this.verifyingOtp = true;
    this.mobileNumberVerificationService
      .verifyOtp(this.value)
      .pipe(finalize(() => (this.verifyingOtp = false)))
      .subscribe({
        complete: () =>
          this.popoverController.dismiss({ action: 'SUCCESS', homeCurrency: this.extendedOrgUser.org.currency }),
        error: () => this.setError('INVALID_OTP'),
      });
  }

  setError(error: ErrorType, attemptsLeft = 5): void {
    const errorMapping = {
      LIMIT_REACHED: this.translocoService.translate('verifyNumberPopover.limitReached'),
      INVALID_MOBILE_NUMBER: this.translocoService.translate('verifyNumberPopover.invalidMobileNumber'),
      INVALID_OTP: this.translocoService.translate('verifyNumberPopover.invalidOtp'),
      INVALID_INPUT: this.translocoService.translate('verifyNumberPopover.invalidInput'),
      ATTEMPTS_LEFT: this.translocoService.translate('verifyNumberPopover.attemptsLeft', {
        attemptsLeft,
        plural: attemptsLeft > 1 ? 's' : '',
      }),
    };

    this.error = errorMapping[error];
  }

  startTimer(): void {
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
