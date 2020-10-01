import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';



@NgModule({
  declarations: [
    EllipsisPipe,
    HumanizeCurrencyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EllipsisPipe,
  	HumanizeCurrencyPipe
  ]
})
export class SharedModule { }
