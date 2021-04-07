// @Link:  https://stackoverflow.com/a/31162426
import { Directive, ElementRef, OnInit, HostListener } from '@angular/core';
import * as moment from 'moment';
@Directive({
  selector: '[appFormatDate]'
})
export class FormatDateDirective implements OnInit {
  constructor(private elementRef: ElementRef) { }
  ngOnInit() {
    const initalValue = this.elementRef.nativeElement as HTMLInputElement;
    console.log('initalValue ->', initalValue.value);
    if (initalValue.value) {
      this.elementRef.nativeElement.setAttribute('data-date', moment(initalValue.value).format('MMM DD, YYYY'));
    } else {
      this.elementRef.nativeElement.setAttribute('data-date', '');
    }
  }
  @HostListener('ngModelChange', [ '$event'] ) onChange(value: string) {
    if (value) {
      this.elementRef.nativeElement.setAttribute('data-date', moment(value).format('MMM DD, YYYY'));
    } else {
      this.elementRef.nativeElement.setAttribute('data-date', '');
    }
  }
}