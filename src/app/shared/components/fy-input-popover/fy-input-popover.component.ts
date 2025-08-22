import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-input-popover',
  templateUrl: './fy-input-popover.component.html',
  styleUrls: ['./fy-input-popover.component.scss'],
  standalone: false,
})
export class FyInputPopoverComponent implements AfterViewInit {
  private popoverController = inject(PopoverController);

  private translocoService = inject(TranslocoService);

  @ViewChild('input') inputEl: ElementRef<HTMLInputElement>;

  title: string;

  ctaText: string;

  inputLabel: string;

  inputValue = '';

  inputType = 'text';

  isRequired = true;

  placeholder: string;

  error: string;

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
