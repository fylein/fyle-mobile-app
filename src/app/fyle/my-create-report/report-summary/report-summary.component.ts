import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.scss'],
})
export class ReportSummaryComponent implements OnInit {
  @Input() selectedTotalAmount;

  @Input() selectedTotalTxns;

  @Input() homeCurrency;

  @Input() purpose;

  @Input() action;

  constructor(
    private popoverController: PopoverController
  ) { }

  createReport() {
    this.popoverController.dismiss({
      saveReport: true
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  ngOnInit() { }
}
