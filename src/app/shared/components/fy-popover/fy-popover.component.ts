import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-popover',
  templateUrl: './fy-popover.component.html',
  styleUrls: ['./fy-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, MatIcon, NgStyle, FormsModule, TranslocoPipe],
})
export class FyPopoverComponent implements AfterViewInit {
  @ViewChild('simpleFormInput') simpleFormInput: ElementRef;

  @Input() title = '';

  @Input() formLabel = '';

  @Input() message: string;

  formValue = '';

  constructor(private popoverController: PopoverController) {}

  ngAfterViewInit(): void {
    const formInput = this.simpleFormInput.nativeElement as HTMLInputElement;
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
