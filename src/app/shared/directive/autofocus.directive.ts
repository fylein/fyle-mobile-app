import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  @Input() timeout = 0;

  constructor(private element: ElementRef<HTMLInputElement>) {}

  ngAfterViewInit(): void {
    if (this.timeout) {
      setTimeout(() => {
        this.element.nativeElement.focus();
      }, this.timeout);
    } else {
      this.element.nativeElement.focus();
    }
  }
}
