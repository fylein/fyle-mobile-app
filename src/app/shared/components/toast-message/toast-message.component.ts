import { Component, Inject } from '@angular/core';
import {
  MatSnackBarRef,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  imports: [MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel],
  styleUrls: ['./toast-message.component.scss'],
})
export class ToastMessageComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { icon: string; message: string; redirectionText: string; showCloseButton: boolean },
    private snackBarRef: MatSnackBarRef<ToastMessageComponent>
  ) {}

  closeEvent(): void {
    this.snackBarRef.dismiss();
  }

  actionEvent(): void {
    this.snackBarRef.dismissWithAction();
  }
}
