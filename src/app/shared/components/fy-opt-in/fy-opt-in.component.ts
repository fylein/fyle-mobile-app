import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, inject, viewChild } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from 'src/app/core/services/loader.service';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgClass, DecimalPipe } from '@angular/common';
import { FormButtonValidationDirective } from '../../directive/form-button-validation.directive';

@Component({
  selector: 'app-fy-opt-in',
  templateUrl: './fy-opt-in.component.html',
  styleUrls: ['./fy-opt-in.component.scss'],
  imports: [
    DecimalPipe,
    FormButtonValidationDirective,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    MatIcon,
    MatInput,
    NgClass,
    NgOtpInputComponent,
    TranslocoPipe,
  ],
})
export class FyOptInComponent implements OnInit, AfterViewInit {
  private modalController = inject(ModalController);

  private orgUserService = inject(OrgUserService);

  private authService = inject(AuthService);

  private mobileNumberVerificationService = inject(MobileNumberVerificationService);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private trackingService = inject(TrackingService);

  private matSnackBar = inject(MatSnackBar);

  private loaderService = inject(LoaderService);

  private browserHandlerService = inject(BrowserHandlerService);

  private platformHandlerService = inject(PlatformHandlerService);

  private userEventService = inject(UserEventService);

  private translocoService = inject(TranslocoService);

  readonly mobileInputEl = viewChild<ElementRef<HTMLInputElement>>('mobileInput');

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() optInFlowState: OptInFlowState = OptInFlowState.MOBILE_INPUT;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
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

  get OptInFlowState(): typeof OptInFlowState {
    return OptInFlowState;
  }

  ngOnInit(): void {
    this.mobileNumberInputValue = this.extendedOrgUser.ou.mobile || '';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mobileInputEl().nativeElement.focus();
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
      this.mobileNumberError = this.translocoService.translate('fyOptIn.enterMobileNumber');
    } else if (!this.mobileNumberInputValue.match(/^\+1\d{10}$/)) {
      this.mobileNumberError = this.translocoService.translate('fyOptIn.invalidMobileNumber');
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
            this.toastWithoutCTA(
              this.translocoService.translate('fyOptIn.codeSent'),
              ToastType.SUCCESS,
              'msb-success-with-camera-icon',
            );
            this.ngOtpInput.setValue('');
          }
          this.startTimer();
        } else {
          this.toastWithoutCTA(
            this.translocoService.translate('fyOptIn.otpLimitReached'),
            ToastType.FAILURE,
            'msb-failure-with-camera-icon',
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
              this.translocoService.translate('fyOptIn.otpLimitReached'),
              ToastType.FAILURE,
              'msb-failure-with-camera-icon',
            );
            this.ngOtpInput?.setValue('');
            this.disableResendOtp = true;
          } else if (errorMessage.includes('invalid parameter')) {
            this.toastWithoutCTA(
              this.translocoService.translate('fyOptIn.invalidMobileTryAgain'),
              ToastType.FAILURE,
              'msb-failure-with-camera-icon',
            );
          } else if (errorMessage.includes('expired')) {
            this.toastWithoutCTA(
              this.translocoService.translate('fyOptIn.codeExpired'),
              ToastType.FAILURE,
              'msb-failure-with-camera-icon',
            );
            this.ngOtpInput?.setValue('');
          } else {
            this.toastWithoutCTA(
              this.translocoService.translate('fyOptIn.invalidCode'),
              ToastType.FAILURE,
              'msb-failure-with-camera-icon',
            );
            this.ngOtpInput?.setValue('');
          }
        }

        this.sendCodeLoading = false;
      },
    });
  }

  verifyOtp(otp: string): void {
    this.verifyingOtp = true;
    from(this.loaderService.showLoader(this.translocoService.translate('fyOptIn.verifyingCode')))
      .pipe(
        switchMap(() => this.mobileNumberVerificationService.verifyOtp(otp)),
        switchMap(() => this.authService.refreshEou()),
        finalize(() => this.loaderService.hideLoader()),
      )
      .subscribe({
        complete: () => {
          this.optInFlowState = OptInFlowState.SUCCESS;
          this.verifyingOtp = false;
          this.userEventService.clearTaskCache();
        },
        error: () => {
          this.toastWithoutCTA(
            this.translocoService.translate('fyOptIn.invalidCode'),
            ToastType.FAILURE,
            'msb-failure-with-camera-icon',
          );
          this.ngOtpInput.setValue('');
          this.verifyingOtp = false;
        },
      });
  }

  onOtpChange(otp: string): void {
    if (otp?.length === 6) {
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
      'https://www.fylehq.com/help/en/articles/8045065-submit-your-receipts-via-text-message',
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
