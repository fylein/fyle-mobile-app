import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';

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

  constructor(
    private popoverController: PopoverController,
    private mobileNumberVerificationService: MobileNumberVerificationService
  ) {}

  ngOnInit(): void {
    this.infoBoxText = `Please verify your mobile number using the 6-digit OTP sent to ${this.extendedOrgUser.ou.mobile}`;
    this.resendOtp();
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  goBack() {
    this.popoverController.dismiss({ action: 'BACK' });
  }

  resendOtp() {
    //TODO: Restrict this to 5 times a day
    this.sendingOtp = true;
    this.mobileNumberVerificationService
      .sendOtp()
      .pipe(finalize(() => (this.sendingOtp = false)))
      .subscribe({
        error: () => {
          //TODO: Show error message
        },
      });
  }

  verifyOtp() {
    this.verifyingOtp = true;
    this.mobileNumberVerificationService
      .verifyOtp(this.value)
      .pipe(finalize(() => (this.verifyingOtp = false)))
      .subscribe(() => ({
        complete: () => this.popoverController.dismiss({ action: 'SUCCESS' }),
        error: () => {
          //TODO: Show error message
        },
      }));
  }
}
