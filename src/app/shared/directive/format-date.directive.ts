// @Link:  https://stackoverflow.com/a/31162426

import { Directive, ElementRef, OnInit, HostListener, Renderer2 } from '@angular/core';
import * as dayjs from 'dayjs';

@Directive({
  selector: '[appFormatDate]',
})
export class FormatDateDirective implements OnInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  get selectedElement(): HTMLElement & { name?: string } {
    return this.elementRef?.nativeElement as HTMLElement & { name?: string };
  }

  @HostListener('ngModelChange', ['$event']) onChange(value: string): void {
    this.modifyDisplayValue(value);
  }

  modifyDisplayValue(value: string): void {
    if (this.elementRef && this.selectedElement) {
      if (value) {
        this.renderer.removeClass(this.selectedElement, 'date-input__placeholder');
        this.selectedElement.setAttribute('data-date', dayjs(value).format('MMM DD, YYYY'));
      } else {
        this.renderer.addClass(this.selectedElement, 'date-input__placeholder');
        if (this.selectedElement.name) {
          this.selectedElement.setAttribute('data-date', 'Select ' + this.selectedElement.name);
        } else {
          this.selectedElement.setAttribute('data-date', 'Select date');
        }
      }
    }
  }

  ngOnInit(): void {
    const initalValue = this.elementRef.nativeElement as HTMLInputElement;
    this.modifyDisplayValue(initalValue.value);
  }
}
