import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Expense } from 'src/app/core/models/expense.model';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-remove-expense-report',
  templateUrl: './remove-expense-report.component.html',
  styleUrls: ['./remove-expense-report.component.scss'],
})
export class RemoveExpenseReportComponent implements OnInit {

  @Input() etxn: Expense;
  removalReason = '';

  constructor(
    private popoverController: PopoverController,
    private reportService: ReportService
  ) { }

  ngOnInit() { }

  cancel() {
    this.popoverController.dismiss();
  }

  remove(event) {
    this.reportService.removeTransaction(this.etxn.tx_report_id, this.etxn.tx_id, this.removalReason).subscribe(_ => {
      this.popoverController.dismiss({
        goBack: true
      });
    });
  }
}
