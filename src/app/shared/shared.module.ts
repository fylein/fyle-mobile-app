import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { AdvanceState } from './pipes/advance-state.pipe';
import { InitialsPipe } from './pipes/initials.pipe';
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';

@NgModule({
  declarations: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    AdvanceState,
    InitialsPipe,
    DelegatedAccMessageComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    AdvanceState,
    SnakeCaseToSpaceCase,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule
  ]
})
export class SharedModule { }
