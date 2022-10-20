import { Component, OnInit, Input, Inject } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { CurrencyService } from 'src/app/core/services/currency.service';

@Component({
  selector: 'app-add-txn-to-report-dialog',
  templateUrl: './add-txn-to-report-dialog.component.html',
  styleUrls: ['./add-txn-to-report-dialog.component.scss'],
})
export class AddTxnToReportDialogComponent implements OnInit {
  @Input() openReports;

  reportCurrencySymbol: string;

  constructor(
    private currencyService: CurrencyService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { openReports: ExtendedReport[] },
    private matBottomsheet: MatBottomSheet
  ) {}

  closeAddToReportModal() {
    this.matBottomsheet.dismiss();
  }

  addTransactionToReport(report: ExtendedReport) {
    this.matBottomsheet.dismiss({ report });
  }

  ngOnInit() {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.reportCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });
  }
}
