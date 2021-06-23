import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-expenses-added-to-report-toast-message',
  templateUrl: './expenses-added-to-report-toast-message.component.html',
  styleUrls: ['./expenses-added-to-report-toast-message.component.scss'],
})
export class ExpensesAddedToReportToastMessageComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }
  @Input() report_type: string;

  ngOnInit() {}

  close() {
    this.popoverController.dismiss({action: 'close'})
  }

  viewReport() {
    this.popoverController.dismiss({action: 'view_report'})
  }
 


}
