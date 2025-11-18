import { getCurrencySymbol, NgClass, DatePipe } from '@angular/common';
import { Component, OnInit, Input, input, output } from '@angular/core';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { ReportState } from '../../pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';

@Component({
  selector: 'app-reports-card',
  templateUrl: './reports-card.component.html',
  styleUrls: ['./reports-card.component.scss'],
  imports: [
    MatRipple,
    NgClass,
    MatIcon,
    DatePipe,
    TranslocoPipe,
    EllipsisPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    ExactCurrencyPipe,
  ],
})
export class ReportsCardComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() report: Report;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() prevDate: Date;

  readonly simplifyReportsEnabled = input<boolean>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  readonly gotoReport = output<Report>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  readonly viewComments = output<Report>();

  creationFullDate: string;

  showDate = true;

  actionOpened = false;

  reportCurrencySymbol = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  ngOnInit(): void {
    this.showDate =
      (this.report && new Date(this.report.created_at as string).toDateString()) !==
      (this.prevDate && new Date(this.prevDate).toDateString());

    this.reportCurrencySymbol = getCurrencySymbol(this.report.currency, 'wide');
  }

  onGoToReport(): void {
    this.gotoReport.emit(this.report);
  }

  onViewComments(): void {
    this.viewComments.emit(this.report);
  }
}
