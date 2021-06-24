import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-expenses-added-to-report-toast-message',
  templateUrl: './expenses-added-to-report-toast-message.component.html',
  styleUrls: ['./expenses-added-to-report-toast-message.component.scss'],
})
export class ExpensesAddedToReportToastMessageComponent implements OnInit {

  constructor(
    private matSnackBar: MatSnackBar,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<ExpensesAddedToReportToastMessageComponent>
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

  closeEvent() {
    this.snackBarRef.dismiss();
  }

  actionEvent() {
    this.snackBarRef.dismissWithAction();
  }
 


}
