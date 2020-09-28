import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EllipsisPipe } from './pipes/ellipses.pipe';



@NgModule({
  declarations: [
    EllipsisPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EllipsisPipe
  ]
})
export class SharedModule { }
