import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// pipe imports
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { AdvanceState } from './pipes/advance-state.pipe';
import { InitialsPipe } from './pipes/initials.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';

// component imports
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';
import { CurrencyComponent } from './components/currency/currency.component';
import { CommentsComponent } from './components/comments/comments.component';
import { ViewCommentComponent } from './components/comments/view-comment/view-comment.component';


@NgModule({
  declarations: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    AdvanceState,
    InitialsPipe,
    DelegatedAccMessageComponent,
    CurrencyComponent,
    CommentsComponent,
    ViewCommentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    AdvanceState,
    SnakeCaseToSpaceCase,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule,
    CurrencyComponent,
    CommentsComponent
  ],
  providers: [
    DecimalPipe,
    DatePipe
  ]
})
export class SharedModule { }
