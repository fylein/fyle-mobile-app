import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-input-popover',
  templateUrl: './fy-input-popover.component.html',
  styleUrls: ['./fy-input-popover.component.scss'],
})
export class FyInputPopoverComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputEl: ElementRef;

  @Input() title: string;

  @Input() ctaText: string;

  @Input() inputLabel: string;

  @Input() inputValue = '';

  @Input() inputType = 'text';

  @Input() isRequired = true;

  @Input() placeholder: string;

  error: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  closePopover() {
    this.popoverController.dismiss();
  }

  validateInput() {
    if (this.isRequired) {
      if (this.inputValue?.length === 0) {
        this.error = `Please enter a ${this.inputLabel}`;
      } else if (this.inputType === 'tel' && !this.inputValue.match(/[+]\d{7,}$/)) {
        this.error = 'Please enter a valid mobile number with country code. e.g. +12025559975';
      }
    }
  }

  onFocus() {
    this.error = null;
  }

  saveValue() {
    this.validateInput();
    if (!this.error?.length) {
      this.popoverController.dismiss({ newValue: this.inputValue });
    }
  }
}
