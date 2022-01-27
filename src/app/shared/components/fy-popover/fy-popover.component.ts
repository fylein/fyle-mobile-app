import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-popover',
  templateUrl: './fy-popover.component.html',
  styleUrls: ['./fy-popover.component.scss'],
})
export class FyPopoverComponent implements AfterViewInit {
  @ViewChild('simpleFormInput') simpleFormInput: ElementRef;

  @Input() title = '';

  @Input() formLabel = '';

  formValue = '';

  constructor(private popoverController: PopoverController) {}

  ngAfterViewInit() {
    const formInput = this.simpleFormInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      formInput.focus();
    }, 400);
  }

  dismiss() {
    this.popoverController.dismiss();
  }

  submit() {
    this.popoverController.dismiss({ comment: this.formValue });
  }
}
