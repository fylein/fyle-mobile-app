import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

@Component({
  selector: 'app-verify-number-popover',
  templateUrl: './verify-number-popover.component.html',
  styleUrls: ['./verify-number-popover.component.scss'],
})
export class VerifyNumberPopoverComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputEl: ElementRef;

  @Input() extendedOrgUser: ExtendedOrgUser;

  infoBoxText: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {
    this.infoBoxText = `Please verify your mobile number using the 6-digit OTP sent to ${this.extendedOrgUser.ou.mobile}`;
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  closePopover() {
    this.popoverController.dismiss();
  }

  saveValue() {
    // this.popoverController.dismiss({ newValue: this.inputValue });
  }
}
