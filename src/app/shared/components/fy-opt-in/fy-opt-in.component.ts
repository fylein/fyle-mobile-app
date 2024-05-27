import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize, noop, switchMap } from 'rxjs';
import { OptInFlowState } from 'src/app/core/enums/opt-in-flow-state.enum';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ErrorType } from 'src/app/fyle/my-profile/verify-number-popover/error-type.model';

@Component({
  selector: 'app-fy-opt-in',
  templateUrl: './fy-opt-in.component.html',
  styleUrls: ['./fy-opt-in.component.scss'],
})
export class FyOptInComponent implements OnInit, AfterViewInit {
  @ViewChild('mobileInput') mobileInputEl: ElementRef<HTMLInputElement>;

  @Input() optInFlowState: OptInFlowState = OptInFlowState.MOBILE_INPUT;

  @Input() extendedOrgUser: ExtendedOrgUser;

  mobileNumberInputValue: string;

  mobileNumberError: string;

  sendCodeLoading = false;

  otpTimer: number;

  showOtpTimer = false;

  otpError: string;

  disableResendOtp = false;

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private authService: AuthService,
    private mobileNumberVerificationService: MobileNumberVerificationService
  ) {}

  get OptInFlowState(): typeof OptInFlowState {
    return OptInFlowState;
  }

  ngOnInit(): void {
    this.mobileNumberInputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.mobileInputEl.nativeElement.focus(), 400);
  }

  onFocus(): void {
    console.log('onFocus');
  }

  validateInput(): void {
    if (!this.mobileNumberInputValue?.length) {
      this.mobileNumberError = 'Please enter a Mobile Number';
    } else if (!this.mobileNumberInputValue.match(/[+]\d{7,}$/)) {
      this.mobileNumberError = 'Please enter a valid mobile number with country code. e.g. +12025559975';
    }
  }

  saveMobileNumber(): void {
    //If user has not changed the verified mobile number, close the popover
    if (this.mobileNumberInputValue === this.extendedOrgUser.ou.mobile && this.extendedOrgUser.ou.mobile_verified) {
      this.modalController.dismiss();
    } else {
      this.validateInput();
      if (!this.mobileNumberError?.length) {
        this.sendCodeLoading = true;

        const updatedOrgUserDetails = {
          ...this.extendedOrgUser.ou,
          mobile: this.mobileNumberInputValue,
        };
        this.orgUserService
          .postOrgUser(updatedOrgUserDetails)
          .pipe(
            switchMap(() => this.authService.refreshEou()),
            finalize(() => {
              this.sendCodeLoading = false;
            })
          )
          .subscribe({
            complete: () => {
              this.optInFlowState = OptInFlowState.OTP_VERIFICATION;
              this.resendOtp('INITIAL');
            },
            error: () => noop,
          });
      }
    }
  }

  resendOtp(action: 'CLICK' | 'INITIAL'): void {
    this.sendCodeLoading = true;
    this.mobileNumberVerificationService
      .sendOtp()
      .pipe(finalize(() => (this.sendCodeLoading = false)))
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
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            const error = err.error as { message: string };
            const errorMessage = error.message?.toLowerCase() || '';
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

  setError(error: ErrorType, attemptsLeft = 5): void {
    const errorMapping = {
      LIMIT_REACHED:
        'You have exhausted the limit to request code for your mobile number. Please try again after 24 hours.',
      INVALID_MOBILE_NUMBER: 'Invalid mobile number. Please try again',
      INVALID_OTP: 'Incorrect mobile number or code. Please try again.',
      INVALID_INPUT: 'Please enter 6 digit code',
      ATTEMPTS_LEFT: `You have ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left to verify mobile number.`,
    };

    this.otpError = errorMapping[error];
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
