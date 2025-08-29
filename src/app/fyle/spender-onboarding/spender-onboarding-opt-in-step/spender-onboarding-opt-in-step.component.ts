import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalController } from '@ionic/angular';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';
import { finalize, from, Subscription, switchMap } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { OptInFlowState } from 'src/app/core/enums/opt-in-flow-state.enum';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { OtpDetails } from 'src/app/core/models/otp-details.model';
import { PlatformCorporateCard } from 'src/app/core/models/platform/platform-corporate-card.model';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { SpenderOnboardingService } from 'src/app/core/services/spender-onboarding.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-spender-onboarding-opt-in-step',
  templateUrl: './spender-onboarding-opt-in-step.component.html',
  styleUrls: ['./spender-onboarding-opt-in-step.component.scss'],
  standalone: false,
})
export class SpenderOnboardingOptInStepComponent implements OnInit, OnChanges {
  private fb = inject(UntypedFormBuilder);

  private trackingService = inject(TrackingService);

  private orgUserService = inject(OrgUserService);

  private authService = inject(AuthService);

  private mobileNumberVerificationService = inject(MobileNumberVerificationService);

  private loaderService = inject(LoaderService);

  private matSnackBar = inject(MatSnackBar);

  private userEventService = inject(UserEventService);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private spenderOnboardingService = inject(SpenderOnboardingService);

  private translocoService = inject(TranslocoService);

  readonly mobileInputEl = viewChild<ElementRef<HTMLInputElement>>('mobileInput');

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() eou: ExtendedOrgUser;

  readonly areCardsEnrolled = input<boolean>(undefined);

  readonly isStepComplete = output<boolean>();

  readonly goToConnectCard = output<boolean>();

  cardForm: UntypedFormControl;

  isVisaRTFEnabled = false;

  isMastercardRTFEnabled = false;

  cardType = CardNetworkType;

  enrollableCards: PlatformCorporateCard[];

  cardValuesMap: Record<string, { card_type: string; card_number: string }> = {};

  rtfCardType: CardNetworkType;

  cardsList: PopoverCardsList = {
    successfulCards: [],
    failedCards: [],
  };

  fg: UntypedFormGroup;

  optInFlowState: OptInFlowState = OptInFlowState.MOBILE_INPUT;

  mobileNumberInputValue: string;

  mobileNumberError = '';

  sendCodeLoading = false;

  otpTimer: number;

  showOtpTimer = false;

  otpError: string;

  disableResendOtp = false;

  otpAttemptsLeft: number;

  verifyingOtp = false;

  hardwareBackButtonAction: Subscription;

  isConnectCardsSkipped = false;

  savingMobileNumber = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.eou.currentValue !== changes.eou.previousValue) {
      this.mobileNumberInputValue = this.eou.ou.mobile;
      if (this.eou.ou.mobile) {
        this.optInFlowState = OptInFlowState.OTP_VERIFICATION;
        this.resendOtp('INITIAL');
      }
    }
  }

  ngOnInit(): void {
    this.trackingService.eventTrack('Sms Opt In Onboarding Step - Viewed');
    this.fg = this.fb.group({});
    this.fg.addControl('mobile_number', this.fb.control('', [Validators.required, Validators.maxLength(10)]));
    this.spenderOnboardingService.getOnboardingStatus().subscribe((onboardingStatus) => {
      if (onboardingStatus.step_connect_cards_is_skipped === true) {
        this.isConnectCardsSkipped = true;
      }
    });
  }

  goBack(): void {
    if (this.optInFlowState === OptInFlowState.OTP_VERIFICATION) {
      this.trackingService.eventTrack('Sms Opt In Onboarding Step - Edit Number');
      this.optInFlowState = OptInFlowState.MOBILE_INPUT;
    }
  }

  validateInput(): void {
    if (!this.mobileNumberInputValue?.length) {
      this.mobileNumberError = this.translocoService.translate('spenderOnboardingOptInStep.mobileNumberError');
    } else if (!this.mobileNumberInputValue.match(/^\+1\d{10}$/)) {
      this.mobileNumberError = this.translocoService.translate('spenderOnboardingOptInStep.invalidMobileNumberError');
    } else {
      this.mobileNumberError = '';
    }
  }

  saveMobileNumber(): void {
    this.savingMobileNumber = true;

    //If user has not changed the verified mobile number, close the popover
    if (this.mobileNumberInputValue === this.eou.ou.mobile && this.eou.ou.mobile_verified) {
      this.optInFlowState = OptInFlowState.OTP_VERIFICATION;
    } else {
      this.validateInput();
      if (!this.mobileNumberError?.length) {
        this.sendCodeLoading = true;

        const updatedOrgUserDetails = {
          ...this.eou.ou,
          mobile: this.mobileNumberInputValue,
        };
        this.orgUserService
          .postOrgUser(updatedOrgUserDetails)
          .pipe(
            switchMap(() => this.authService.refreshEou()),
            finalize(() => {
              this.savingMobileNumber = false;
            }),
          )
          .subscribe({
            complete: () => {
              this.resendOtp('INITIAL');
            },
            error: () => {
              this.sendCodeLoading = false;
            },
          });
      } else {
        this.savingMobileNumber = false;
        return;
      }
    }
  }

  goBackToConnectCard(): void {
    this.goToConnectCard.emit(true);
  }

  handleOtpSuccess(otpDetails: Partial<OtpDetails>, action: string): void {
    this.otpAttemptsLeft = otpDetails.attempts_left;

    if (action === 'INITIAL') {
      this.optInFlowState = OptInFlowState.OTP_VERIFICATION;
    }

    if (this.otpAttemptsLeft > 0) {
      if (action === 'CLICK') {
        this.toastWithoutCTA(
          this.translocoService.translate('spenderOnboardingOptInStep.codeSentSuccess'),
          ToastType.SUCCESS,
          'msb-success-with-camera-icon',
        );
        this.ngOtpInput.setValue('');
      }
      this.startTimer();
    } else {
      this.toastWithoutCTA(
        this.translocoService.translate('spenderOnboardingOptInStep.otpLimitReached'),
        ToastType.FAILURE,
        'msb-failure-with-camera-icon',
      );
      this.disableResendOtp = true;
      this.trackingService.eventTrack('Sms Opt In Onboarding Step - Max Otp Attempts Reached');
    }

    this.sendCodeLoading = false;
  }

  handleOtpError(err: HttpErrorResponse): void {
    if (err.status === 400) {
      const error = err.error as { message: string };
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('out of attempts') || errorMessage.includes('max send attempts reached')) {
        this.trackingService.eventTrack('Sms Opt In Onboarding Step - Max Otp Attempts Reached');
        this.toastWithoutCTA(
          this.translocoService.translate('spenderOnboardingOptInStep.otpLimitReached'),
          ToastType.FAILURE,
          'msb-failure-with-camera-icon',
        );
        this.ngOtpInput?.setValue('');
        this.disableResendOtp = true;
      } else if (errorMessage.includes('invalid parameter')) {
        this.toastWithoutCTA(
          this.translocoService.translate('spenderOnboardingOptInStep.invalidMobileNumberToast'),
          ToastType.FAILURE,
          'msb-failure-with-camera-icon',
        );
      } else if (errorMessage.includes('expired')) {
        this.toastWithoutCTA(
          this.translocoService.translate('spenderOnboardingOptInStep.codeExpired'),
          ToastType.FAILURE,
          'msb-failure-with-camera-icon',
        );
        this.ngOtpInput?.setValue('');
      } else {
        this.toastWithoutCTA(
          this.translocoService.translate('spenderOnboardingOptInStep.invalidCode'),
          ToastType.FAILURE,
          'msb-failure-with-camera-icon',
        );
        this.ngOtpInput?.setValue('');
      }
    }

    this.sendCodeLoading = false;
  }

  resendOtp(action: 'CLICK' | 'INITIAL'): void {
    this.sendCodeLoading = true;
    this.mobileNumberVerificationService.sendOtp().subscribe({
      next: (otpDetails) => {
        this.handleOtpSuccess(otpDetails, action);
      },
      error: (err: HttpErrorResponse) => {
        this.handleOtpError(err);
      },
    });
  }

  verifyOtp(otp: string): void {
    this.verifyingOtp = true;
    from(
      this.loaderService.showLoader(this.translocoService.translate('spenderOnboardingOptInStep.verifyingCodeLoader')),
    )
      .pipe(
        switchMap(() => this.mobileNumberVerificationService.verifyOtp(otp)),
        switchMap(() => this.authService.refreshEou()),
        finalize(() => this.loaderService.hideLoader()),
      )
      .subscribe({
        complete: () => {
          this.optInFlowState = OptInFlowState.SUCCESS;
          this.verifyingOtp = false;
          this.isStepComplete.emit(true);
          this.trackingService.eventTrack('Sms Opt In Onboarding Step - Completed');
          this.userEventService.clearTaskCache();
        },
        error: () => {
          this.toastWithoutCTA(
            this.translocoService.translate('spenderOnboardingOptInStep.invalidCode'),
            ToastType.FAILURE,
            'msb-failure-with-camera-icon',
          );
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
