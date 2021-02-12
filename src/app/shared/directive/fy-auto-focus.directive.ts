import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFyAutoFocus]'
})
export class FyAutoFocusDirective {

  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    console.log()
    this.host.nativeElement.setFocus();
  }
}
