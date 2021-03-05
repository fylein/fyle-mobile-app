import { Directive, Input, ElementRef, OnChanges } from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[appFormatDate]'
})
export class FormatDateDirective implements OnChanges {
  @Input() dateValue: string;
  @Input() dateFormat = "MMM DD, YYYY";

  constructor(private elementRef: ElementRef) { }

  ngOnChanges () {
    if (this.dateValue) {
      this.elementRef.nativeElement.setAttribute("data-date", moment(this.dateValue).format(this.dateFormat));
    }
  }
};