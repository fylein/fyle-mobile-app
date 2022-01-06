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

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.inputEl.nativeElement.focus();
  }

  closePopover() {
    this.popoverController.dismiss();
  }

  saveValue() {
    this.popoverController.dismiss({ newValue: this.inputValue });
  }
}
