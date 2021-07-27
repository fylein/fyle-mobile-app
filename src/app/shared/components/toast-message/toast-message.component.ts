import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss'],
})
export class ToastMessageComponent implements OnInit {

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: {icon: string; message: string; redirectionText: string; showCloseButton: boolean},
    private snackBarRef: MatSnackBarRef<ToastMessageComponent>
  ) { }

  ngOnInit() {
  }

  closeEvent() {
    this.snackBarRef.dismiss();
  }

  actionEvent() {
    this.snackBarRef.dismissWithAction();
  }

}
