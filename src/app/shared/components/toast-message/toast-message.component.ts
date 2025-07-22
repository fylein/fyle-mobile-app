import { Component, Inject } from '@angular/core';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
  MatSnackBarLabel,
  MatSnackBarActions,
  MatSnackBarAction,
} from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss'],
  standalone: true,
  imports: [MatSnackBarLabel, MatIcon, MatSnackBarActions, MatSnackBarAction],
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
