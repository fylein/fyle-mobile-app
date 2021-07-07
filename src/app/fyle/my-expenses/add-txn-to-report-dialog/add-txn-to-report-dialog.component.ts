import { Component, OnInit, Input, Inject } from '@angular/core';
import { noop } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrencySymbol } from '@angular/common';
import { OfflineService } from 'src/app/core/services/offline.service';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ExtendedReport } from 'src/app/core/models/report.model';

@Component({
  selector: 'app-add-txn-to-report-dialog',
  templateUrl: './add-txn-to-report-dialog.component.html',
  styleUrls: ['./add-txn-to-report-dialog.component.scss'],
})
export class AddTxnToReportDialogComponent implements OnInit {

  @Input() openReports;
  reportCurrencySymbol: string;

  constructor(
    private offlineService: OfflineService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {openReports: ExtendedReport[]},
    private matBottomsheet: MatBottomSheet
  ) { }

  closeAddToReportModal() {
    this.matBottomsheet.dismiss();
  }

  addTransactionToReport(report: ExtendedReport) {
    this.matBottomsheet.dismiss({report});
  }

  ngOnInit() {
    this.offlineService.getHomeCurrency().subscribe((homeCurrency) => {
      this.reportCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });
  }

}
