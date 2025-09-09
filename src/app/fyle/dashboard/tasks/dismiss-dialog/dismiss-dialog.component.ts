import { Component, Input, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PopoverController, IonicModule } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgClass } from '@angular/common';
import { FormButtonValidationDirective } from '../../../../shared/directive/form-button-validation.directive';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-dismiss-dialog',
    templateUrl: './dismiss-dialog.component.html',
    styleUrls: ['./dismiss-dialog.component.scss'],
    imports: [
        IonicModule,
        NgClass,
        FormButtonValidationDirective,
        TranslocoPipe,
    ],
})
export class DismissDialogComponent implements OnInit {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
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
