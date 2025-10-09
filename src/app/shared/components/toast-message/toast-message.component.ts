import { Component, inject } from '@angular/core';
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
  imports: [MatSnackBarLabel, MatIcon, MatSnackBarActions, MatSnackBarAction],
})
export class ToastMessageComponent {
  data = inject<{
    icon: string;
    message: string;
    redirectionText: string;
    showCloseButton: boolean;
    messageType: 'success' | 'failure' | 'information';
  }>(MAT_SNACK_BAR_DATA);

  private snackBarRef = inject<MatSnackBarRef<ToastMessageComponent>>(MatSnackBarRef);

  closeEvent(): void {
    this.snackBarRef.dismiss();
  }

  actionEvent(): void {
    this.snackBarRef.dismissWithAction();
  }
}
