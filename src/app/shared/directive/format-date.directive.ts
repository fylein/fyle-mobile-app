// @Link:  https://stackoverflow.com/a/31162426

import { Directive, ElementRef, HostListener, Renderer2, inject, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

@Directive({ selector: '[appFormatDate]' })
export class FormatDateDirective implements AfterViewInit {
  private elementRef = inject(ElementRef);

  private renderer = inject(Renderer2);

  private translocoService = inject(TranslocoService);

  private datePipe = inject(DatePipe);

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
        const formatted = this.datePipe.transform(value) || '';
        this.selectedElement.setAttribute('data-date', formatted);
      } else {
        this.renderer.addClass(this.selectedElement, 'date-input__placeholder');
        if (this.selectedElement.name) {
          this.selectedElement.setAttribute(
            'data-date',
            this.translocoService.translate('directives.formatDate.selectNamePlaceholder', {
              name: this.selectedElement.name,
            }),
          );
        } else {
          this.selectedElement.setAttribute(
            'data-date',
            this.translocoService.translate('directives.formatDate.selectDatePlaceholder'),
          );
        }
      }
    }
  }

  ngAfterViewInit(): void {
    const initalValue = this.elementRef.nativeElement as HTMLInputElement;
    this.modifyDisplayValue(initalValue.value);
  }
}
