import { Component, OnInit, Input, inject } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Router } from '@angular/router';
import { Report } from 'src/app/core/models/platform/v1/report.model';
@Component({
  selector: 'app-add-txn-to-report-dialog',
  templateUrl: './add-txn-to-report-dialog.component.html',
  styleUrls: ['./add-txn-to-report-dialog.component.scss'],
  standalone: false,
})
export class AddTxnToReportDialogComponent implements OnInit {
  private currencyService = inject(CurrencyService);

  data = inject<{
    openReports: Report[];
    isNewReportsFlowEnabled: boolean;
  }>(MAT_BOTTOM_SHEET_DATA);

  private matBottomsheet = inject(MatBottomSheet);

  private router = inject(Router);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() openReports;

  reportCurrencySymbol: string;

  closeAddToReportModal(): void {
    this.matBottomsheet.dismiss();
  }

  onClickCreateReportTask(): void {
    this.matBottomsheet.dismiss();
    this.router.navigate(['/', 'enterprise', 'my_create_report']);
  }

  addTransactionToReport(report: Report): void {
    this.matBottomsheet.dismiss({ report });
  }

  ngOnInit(): void {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.reportCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });
  }
}
