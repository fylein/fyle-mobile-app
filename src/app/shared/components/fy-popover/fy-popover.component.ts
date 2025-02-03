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
