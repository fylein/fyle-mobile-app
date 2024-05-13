import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { ExtendedReport } from 'src/app/core/models/report.model';

@Component({
  selector: 'app-reports-card',
  templateUrl: './reports-card.component.html',
  styleUrls: ['./reports-card.component.scss'],
})
export class ReportsCardComponent implements OnInit {
  @Input() erpt: Report;

  @Input() prevDate: Date;

  @Input() simplifyReportsEnabled: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @Output() deleteReport: EventEmitter<Report> = new EventEmitter();

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
      (this.erpt && new Date(this.erpt.created_at as string).toDateString()) !==
      (this.prevDate && new Date(this.prevDate).toDateString());

    this.reportCurrencySymbol = getCurrencySymbol(this.erpt.currency, 'wide');
  }

  onDeleteReport(): void {
    this.deleteReport.emit(this.erpt);
  }

  onGoToReport(): void {
    this.gotoReport.emit(this.erpt);
  }

  onViewComments(): void {
    this.viewComments.emit(this.erpt);
  }
}
