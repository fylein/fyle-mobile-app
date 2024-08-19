import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PopoverController } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dismiss-dialog',
  templateUrl: './dismiss-dialog.component.html',
  styleUrls: ['./dismiss-dialog.component.scss'],
})
export class DismissDialogComponent implements OnInit {
  @Input() dismissMethod: () => Observable<any>;

  dismissCallInProgress = false;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  cancel() {
    if (!this.dismissCallInProgress) {
      this.popoverController.dismiss();
    }
  }

  dismiss() {
    this.dismissCallInProgress = true;
    this.dismissMethod()
      .pipe(
        map((res) => ({ status: 'success' })),
        catchError(() =>
          of({
            status: 'error',
          })
        ),
        finalize(() => (this.dismissCallInProgress = false))
      )
      .subscribe((res) => {
        this.popoverController.dismiss(res);
      });
  }
}
