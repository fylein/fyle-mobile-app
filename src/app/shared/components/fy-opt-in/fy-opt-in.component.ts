import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription, finalize, from, switchMap } from 'rxjs';
import { OptInFlowState } from 'src/app/core/enums/opt-in-flow-state.enum';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { NgOtpInputConfig, NgOtpInputComponent } from 'ng-otp-input';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { LoaderService } from 'src/app/core/services/loader.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { UserEventService } from 'src/app/core/services/user-event.service';

@Component({
  selector: 'app-fy-opt-in',
  templateUrl: './fy-opt-in.component.html',
  styleUrls: ['./fy-opt-in.component.scss'],
})
export class FyOptInComponent implements OnInit, AfterViewInit {
  @ViewChild('mobileInput') mobileInputEl: ElementRef<HTMLInputElement>;

  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  @Input() optInFlowState: OptInFlowState = OptInFlowState.MOBILE_INPUT;

  @Input() extendedOrgUser: ExtendedOrgUser;

  mobileNumberInputValue: string;

  mobileNumberError: string;

  sendCodeLoading = false;

  otpTimer: number;

  showOtpTimer = false;

  otpError: string;

  disableResendOtp = false;

  otpAttemptsLeft: number;

  verifyingOtp = false;

  hardwareBackButtonAction: Subscription;

  otpConfig: NgOtpInputConfig = {
    allowNumbersOnly: true,
    length: 6,
    inputStyles: {
      width: '48px',
      height: '48px',
      boxShadow: '0px 0px 8px 0px rgba(44, 48, 78, 0.1)',
      border: 'none',
    },
  };

  constructor(
    private modalController: ModalController,
    private orgUserService: OrgUserService,
    private authService: AuthService,
    private mobileNumberVerificationService: MobileNumberVerificationService,
    private snackbarProperties: SnackbarPropertiesService,
    private trackingService: TrackingService,
    private matSnackBar: MatSnackBar,
    private loaderService: LoaderService,
    private browserHandlerService: BrowserHandlerService,
    private platformHandlerService: PlatformHandlerService,
    private userEventService: UserEventService
  ) {}

  get OptInFlowState(): typeof OptInFlowState {
    return OptInFlowState;
  }

  ngOnInit(): void {
    this.mobileNumberInputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mobileInputEl.nativeElement.focus();
    }, 400);
  }

  onFocus(): void {
    this.mobileNumberError = null;
  }

  ionViewWillEnter(): void {
    const priority = BackButtonActionPriority.MEDIUM;
    this.hardwareBackButtonAction = this.platformHandlerService.registerBackButtonAction(priority, this.goBack);

    this.trackingService.openOptInDialog({
      isMobileNumberPresent: !!this.extendedOrgUser.ou.mobile,
      isUserVerified: this.extendedOrgUser.ou.mobile_verified,
    });
  }

  goBack(): void {
    if (this.optInFlowState === OptInFlowState.OTP_VERIFICATION) {
      this.trackingService.optInFlowRetry({
        message: 'EDIT_NUMBER',
      });
      this.optInFlowState = OptInFlowState.MOBILE_INPUT;
    } else if (this.optInFlowState === OptInFlowState.SUCCESS) {
      this.trackingService.optInFlowSuccess({
        message: 'SUCCESS',
      });
      this.modalController.dismiss({ action: 'SUCCESS' });
    } else {
      this.trackingService.skipOptInFlow();
      this.modalController.dismiss();
    }
  }

  validateInput(): void {
    if (!this.mobileNumberInputValue?.length) {
      this.mobileNumberError = 'Please enter mobile number';
    } else if (!this.mobileNumberInputValue.match(/^\+1\d{10}$/)) {
      this.mobileNumberError = 'Please enter a valid number with +1 country code. Try re-entering your number.';
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
          .pipe(switchMap(() => this.authService.refreshEou()))
          .subscribe({
            complete: () => {
              this.resendOtp('INITIAL');
            },
            error: () => {
              this.sendCodeLoading = false;
            },
          });
      }
    }
  }

  resendOtp(action: 'CLICK' | 'INITIAL'): void {
    this.sendCodeLoading = true;
    this.mobileNumberVerificationService.sendOtp().subscribe({
      next: (otpDetails) => {
        this.otpAttemptsLeft = otpDetails.attempts_left;

        if (action === 'INITIAL') {
          this.optInFlowState = OptInFlowState.OTP_VERIFICATION;
        }

        if (this.otpAttemptsLeft > 0) {
          if (action === 'CLICK') {
            this.toastWithoutCTA('Code sent successfully', ToastType.SUCCESS, 'msb-success-with-camera-icon');
            this.ngOtpInput.setValue('');
          }
          this.startTimer();
        } else {
          this.toastWithoutCTA(
            'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
            ToastType.FAILURE,
            'msb-failure-with-camera-icon'
          );
          this.disableResendOtp = true;
        }

        this.sendCodeLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) {
          const error = err.error as { message: string };
          const errorMessage = error.message?.toLowerCase() || '';
          if (errorMessage.includes('out of attempts') || errorMessage.includes('max send attempts reached')) {
            this.trackingService.optInFlowError({
              message: 'OTP_MAX_ATTEMPTS_REACHED',
            });
            this.toastWithoutCTA(
              'You have reached the limit for 6 digit code requests. Try again after 24 hours.',
              ToastType.FAILURE,
              'msb-failure-with-camera-icon'
            );
            this.ngOtpInput?.setValue('');
            this.disableResendOtp = true;
          } else if (errorMessage.includes('invalid parameter')) {
            this.toastWithoutCTA(
              'Invalid mobile number. Please try again.',
              ToastType.FAILURE,
              'msb-failure-with-camera-icon'
            );
          } else if (errorMessage.includes('expired')) {
            this.toastWithoutCTA(
              'The code has expired. Please request a new one.',
              ToastType.FAILURE,
              'msb-failure-with-camera-icon'
            );
            this.ngOtpInput?.setValue('');
          } else {
            this.toastWithoutCTA('Code is invalid', ToastType.FAILURE, 'msb-failure-with-camera-icon');
            this.ngOtpInput?.setValue('');
          }
        }

        this.sendCodeLoading = false;
      },
    });
  }

  verifyOtp(otp: string): void {
    this.verifyingOtp = true;
    from(this.loaderService.showLoader('Verifying code...'))
      .pipe(
        switchMap(() => this.mobileNumberVerificationService.verifyOtp(otp)),
        switchMap(() => this.authService.refreshEou()),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe({
        complete: () => {
          this.optInFlowState = OptInFlowState.SUCCESS;
          this.verifyingOtp = false;
          this.userEventService.clearTaskCache();
        },
        error: () => {
          this.toastWithoutCTA('Code is invalid', ToastType.FAILURE, 'msb-failure-with-camera-icon');
          this.ngOtpInput.setValue('');
          this.verifyingOtp = false;
        },
      });
  }

  onOtpChange(otp: string): void {
    if (otp.length === 6) {
      this.verifyOtp(otp);
    }
  }

  toastWithoutCTA(toastMessage: string, toastType: ToastType, panelClass: string): void {
    const message = toastMessage;

    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClass],
    });
    this.trackingService.showToastMessage({ ToastContent: message });
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

  async openHelpArticle(): Promise<void> {
    this.trackingService.clickedOnHelpArticle();
    await this.browserHandlerService.openLinkWithToolbarColor(
      '#280a31',
      'https://www.fylehq.com/help/en/articles/8045065-submit-your-receipts-via-text-message'
    );
  }

  onGotItClicked(): void {
    this.trackingService.optInFlowSuccess({
      message: 'SUCCESS',
    });
    this.modalController.dismiss({ action: 'SUCCESS' });
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
  }
}
