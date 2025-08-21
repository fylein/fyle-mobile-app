import { Component, Input, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PopoverController } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dismiss-dialog',
  templateUrl: './dismiss-dialog.component.html',
  styleUrls: ['./dismiss-dialog.component.scss'],
  standalone: false,
})
export class DismissDialogComponent implements OnInit {
  private popoverController = inject(PopoverController);

  @Input() dismissMethod: () => Observable<{}>;

  dismissCallInProgress: boolean;

  ngOnInit(): void {
    this.dismissCallInProgress = false;
  }

  cancel(): void {
    if (!this.dismissCallInProgress) {
      this.popoverController.dismiss();
    }
  }

  dismiss(): void {
    this.dismissCallInProgress = true;
    this.dismissMethod()
      .pipe(
        map(() => ({ status: 'success' })),
        catchError(() =>
          of({
            status: 'error',
          }),
        ),
        finalize(() => (this.dismissCallInProgress = false)),
      )
      .subscribe((res) => {
        this.popoverController.dismiss(res);
      });
  }
}
