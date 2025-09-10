import { AfterViewInit, Component, ElementRef, Input, inject, input, viewChild } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-popover',
  templateUrl: './fy-popover.component.html',
  styleUrls: ['./fy-popover.component.scss'],
  imports: [IonicModule, MatIcon, NgStyle, FormsModule, TranslocoPipe],
})
export class FyPopoverComponent implements AfterViewInit {
  private popoverController = inject(PopoverController);

  readonly simpleFormInput = viewChild<ElementRef>('simpleFormInput');

  readonly title = input('');

  readonly formLabel = input('');

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() message: string;

  formValue = '';

  ngAfterViewInit(): void {
    const formInput = this.simpleFormInput().nativeElement as HTMLInputElement;
    setTimeout(() => {
      formInput.focus();
    }, 400);
  }

  dismiss(): void {
    this.popoverController.dismiss();
  }

  submit(): void {
    this.popoverController.dismiss({ comment: this.formValue });
  }
}
