// @Link:  https://stackoverflow.com/a/31162426

import { Directive, ElementRef, OnInit, HostListener, Renderer2 } from '@angular/core';
import * as dayjs from 'dayjs';
import { from } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Directive({
  selector: '[appFormatDate]',
})
export class FormatDateDirective implements OnInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2, private authService: AuthService) {}

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
        this.setDateFormat(value);
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

  setDateFormat(value: string): void {
    let dateFormat = 'MMM DD, YYYY';

    from(this.authService.getEou()).subscribe((eou) => {
      dateFormat = this.getCurrencyToDateFormatMapping(eou.org.currency);

      this.selectedElement.setAttribute('data-date', dayjs(value).format(dateFormat));
    });
  }

  ngOnInit(): void {
    const initalValue = this.elementRef.nativeElement as HTMLInputElement;
    this.modifyDisplayValue(initalValue.value);
  }

  getCurrencyToDateFormatMapping(currency: string): string {
    const currencyToDateFormatMapping: Record<string, string> = {
      USD: 'MM/DD/YYYY',
      INR: 'DD/MM/YYYY',
      AUD: 'DD/MM/YYYY',
      CAD: 'YYYY/MM/DD',
      EUR: 'DD/MM/YYYY',
    };

    return currencyToDateFormatMapping[currency] || 'MMM DD, YYYY';
  }
}
