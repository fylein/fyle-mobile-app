import { Component, OnInit, Input, inject } from '@angular/core';
import { getCurrencySymbol, TitleCasePipe } from '@angular/common';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Router } from '@angular/router';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { FyZeroStateComponent } from '../../../shared/components/fy-zero-state/fy-zero-state.component';
import { ExactCurrencyPipe } from '../../../shared/pipes/exact-currency.pipe';
import { ReportState } from '../../../shared/pipes/report-state.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonCol, IonGrid, IonHeader, IonIcon, IonRow } from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-txn-to-report-dialog',
  templateUrl: './add-txn-to-report-dialog.component.html',
  styleUrls: ['./add-txn-to-report-dialog.component.scss'],
  imports: [
    ExactCurrencyPipe,
    FyZeroStateComponent,
    IonCol,
    IonGrid,
    IonHeader,
    IonIcon,
    IonRow,
    MatIcon,
    MatRipple,
    ReportState,
    TitleCasePipe,
    TranslocoPipe
  ],
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
