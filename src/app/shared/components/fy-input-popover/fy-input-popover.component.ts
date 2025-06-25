import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-input-popover',
  templateUrl: './fy-input-popover.component.html',
  styleUrls: ['./fy-input-popover.component.scss'],
})
export class FyInputPopoverComponent implements AfterViewInit {
  @ViewChild('input') inputEl: ElementRef<HTMLInputElement>;

  @Input() title: string;

  @Input() ctaText: string;

  @Input() inputLabel: string;

  @Input() inputValue = '';

  @Input() inputType = 'text';

  @Input() isRequired = true;

  @Input() placeholder: string;

  error: string;

  constructor(private popoverController: PopoverController, private translocoService: TranslocoService) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl.nativeElement.focus(), 400);
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  validateInput(): void {
    if (this.isRequired) {
      if (this.inputValue?.length === 0) {
        this.error = this.translocoService.translate('fyInputPopover.errorEnterLabel', { inputLabel: this.inputLabel });
      } else if (this.inputType === 'tel' && !this.inputValue.match(/[+]\d{7,}$/)) {
        this.error = this.translocoService.translate('fyInputPopover.errorValidMobile');
      }
    }
  }

  onFocus(): void {
    this.error = null;
  }

  saveValue(): void {
    this.validateInput();
    if (!this.error?.length) {
      this.popoverController.dismiss({ newValue: this.inputValue });
    }
  }
}
