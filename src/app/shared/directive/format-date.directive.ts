// @Link:  https://stackoverflow.com/a/31162426

import { Directive, ElementRef, OnInit, HostListener, Renderer2 } from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[appFormatDate]',
})
export class FormatDateDirective implements OnInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('ngModelChange', ['$event']) onChange(value: string) {
    this.modifyDisplayValue(value);
  }

  modifyDisplayValue(value: string) {
    if (this.elementRef && this.elementRef.nativeElement) {
      if (value) {
        this.renderer.removeClass(this.elementRef.nativeElement, 'date-input__placeholder');
        this.elementRef.nativeElement.setAttribute('data-date', moment(value).format('MMM DD, YYYY'));
      } else {
        this.renderer.addClass(this.elementRef.nativeElement, 'date-input__placeholder');
        if (this.elementRef.nativeElement.name) {
          this.elementRef.nativeElement.setAttribute('data-date', 'Select ' + this.elementRef.nativeElement.name);
        } else {
          this.elementRef.nativeElement.setAttribute('data-date', 'Select date');
        }
      }
    }
  }

  ngOnInit() {
    const initalValue = this.elementRef.nativeElement as HTMLInputElement;
    this.modifyDisplayValue(initalValue.value);
  }
}
