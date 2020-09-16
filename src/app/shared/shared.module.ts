import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HumanizeCurrencyPipe } from './pipe/humanize-currency.pipe';



@NgModule({
  declarations: [HumanizeCurrencyPipe],
  imports: [
    CommonModule
  ],
  exports: [
  	HumanizeCurrencyPipe
  ]
})
export class SharedModule { }
