import { Component, Inject, OnInit } from '@angular/core';
import {
  MatLegacySnackBarRef as MatSnackBarRef,
  MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA,
} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.scss'],
})
export class ToastMessageComponent implements OnInit {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { icon: string; message: string; redirectionText: string; showCloseButton: boolean },
    private snackBarRef: MatSnackBarRef<ToastMessageComponent>
  ) {}

  ngOnInit() {}

  closeEvent() {
    this.snackBarRef.dismiss();
  }

  actionEvent() {
    this.snackBarRef.dismissWithAction();
  }
}
