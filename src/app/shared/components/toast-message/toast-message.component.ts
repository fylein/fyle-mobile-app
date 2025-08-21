import { Component, inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss'],
  standalone: false,
})
export class ToastMessageComponent {
  data = inject<{
    icon: string;
    message: string;
    redirectionText: string;
    showCloseButton: boolean;
  }>(MAT_SNACK_BAR_DATA);

  private snackBarRef = inject<MatSnackBarRef<ToastMessageComponent>>(MatSnackBarRef);

  closeEvent(): void {
    this.snackBarRef.dismiss();
  }

  actionEvent(): void {
    this.snackBarRef.dismissWithAction();
  }
}
