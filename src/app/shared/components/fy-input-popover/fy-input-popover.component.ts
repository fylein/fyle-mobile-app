import { Component, Input, ElementRef, AfterViewInit, inject, input, viewChild } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-fy-input-popover',
    templateUrl: './fy-input-popover.component.html',
    styleUrls: ['./fy-input-popover.component.scss'],
    imports: [
        IonicModule,
        MatIcon,
        MatInput,
        FormsModule,
        NgClass,
        TranslocoPipe,
    ],
})
export class FyInputPopoverComponent implements AfterViewInit {
  private popoverController = inject(PopoverController);

  private translocoService = inject(TranslocoService);

  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() title: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() ctaText: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() inputLabel: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() inputValue = '';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() inputType = 'text';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isRequired = true;

  readonly placeholder = input<string>(undefined);

  error: string;

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl().nativeElement.focus(), 400);
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
