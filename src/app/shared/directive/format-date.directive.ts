// @Link:  https://stackoverflow.com/a/31162426

import { Directive, Input, ElementRef, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[appFormatDate]'
})
export class FormatDateDirective implements OnChanges {
  @Input() dateValue: string;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges () {
    if (this.dateValue) {
      this.elementRef.nativeElement.setAttribute("data-date", moment(this.dateValue).format('MMM DD, YYYY'));
    }
  }
};
