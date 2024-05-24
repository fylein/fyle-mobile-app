import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-fy-opt-in',
  templateUrl: './fy-opt-in.component.html',
  styleUrls: ['./fy-opt-in.component.scss'],
})
export class FyOptInComponent implements OnInit {
  @ViewChild('input') inputEl: ElementRef<HTMLInputElement>;

  mobileNumberInputValue: string;

  mobileNumberError: string;

  ngOnInit(): void {
    console.log('working');
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
}
