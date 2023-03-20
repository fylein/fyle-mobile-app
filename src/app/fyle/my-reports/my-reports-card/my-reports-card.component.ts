import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-my-reports-card',
  templateUrl: './my-reports-card.component.html',
  styleUrls: ['./my-reports-card.component.scss'],
})
export class MyReportsCardComponent implements OnInit {
  @Input() erpt: ExtendedReport;

  @Input() prevDate: Date;

  @Input() simplifyReportsEnabled: boolean;

  @Output() deleteReport: EventEmitter<ExtendedReport> = new EventEmitter();

  @Output() gotoReport: EventEmitter<ExtendedReport> = new EventEmitter();

  @Output() viewComments: EventEmitter<ExtendedReport> = new EventEmitter();

  creationFullDate: string;

  showDate = true;

  actionOpened = false;

  reportCurrencySymbol = '';

  constructor() {}

  ngOnInit() {
    this.showDate =
      (this.erpt && new Date(this.erpt.rp_created_at).toDateString()) !==
      (this.prevDate && new Date(this.prevDate).toDateString());

    this.reportCurrencySymbol = getCurrencySymbol(this.erpt.rp_currency, 'wide');
  }

  onDeleteReport() {
    this.deleteReport.emit(this.erpt);
  }

  onGoToReport() {
    this.gotoReport.emit(this.erpt);
  }

  onViewComments() {
    this.viewComments.emit(this.erpt);
  }
}
