import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { AdvanceState } from './pipes/advance-state.pipe';



@NgModule({
  declarations: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    AdvanceState
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    AdvanceState,
    SnakeCaseToSpaceCase
  ]
})
export class SharedModule { }
