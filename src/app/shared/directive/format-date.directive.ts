// @Link:  https://stackoverflow.com/a/31162426

import { Directive, Input, ElementRef, OnChanges, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFormatDate]'
})
export class FormatDateDirective implements OnInit {
  @Input() dateValue: string;

  constructor(private elementRef: ElementRef, private control: NgControl) { }

  // ngOnChanges() {
  //   const inputEl = this.elementRef.nativeElement;
  //   if (inputEl.value) {
  //     inputEl.setAttribute('data-date', moment(inputEl.value).format('MMM DD, YYYY'));
  //   }
  // }

  ngOnInit() {

  }

  @HostListener('ngModelChange', [ '$event'] ) onChange(value) {
    if (value) {
      this.elementRef.nativeElement.setAttribute('data-date', moment(this.elementRef.nativeElement.value).format('MMM DD, YYYY'));
    }
  }
}
