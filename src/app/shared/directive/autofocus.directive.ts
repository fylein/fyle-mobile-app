import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: false,
})
export class AutofocusDirective implements AfterViewInit {
  private element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  readonly timeout = input<number>(0);

  ngAfterViewInit(): void {
    if (this.timeout) {
      setTimeout(() => {
        this.element.nativeElement.focus();
      }, this.timeout());
    } else {
      this.element.nativeElement.focus();
    }
  }
}
