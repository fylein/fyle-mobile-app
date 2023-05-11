import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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

  infoBoxText: string;

  constructor(private popoverController: PopoverController, private apiService: ApiService) {}

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
    this.apiService.post('/orgusers/verify_mobile').subscribe((res) => {
      //TODO: Restrict this to 5 times
    });
  }

  verifyOtp() {
    this.apiService.post('/orgusers/check_mobile_verification_code', 123456).subscribe((res) => {
      //TODO: Show success dialog after this
    });
  }
}
