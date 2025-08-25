import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, input } from '@angular/core';
import { Report } from 'src/app/core/models/platform/v1/report.model';

@Component({
  selector: 'app-reports-card',
  templateUrl: './reports-card.component.html',
  styleUrls: ['./reports-card.component.scss'],
  standalone: false,
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
  @Output() gotoReport: EventEmitter<Report> = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @Output() viewComments: EventEmitter<Report> = new EventEmitter();

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
