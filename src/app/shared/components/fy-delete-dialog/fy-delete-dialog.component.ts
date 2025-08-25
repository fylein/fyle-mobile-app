import { Component, Input, OnInit, inject, input } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PopoverController } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoaderPosition } from '../../directive/loader-position.enum';

@Component({
  selector: 'app-fy-delete-dialog',
  templateUrl: './fy-delete-dialog.component.html',
  styleUrls: ['./fy-delete-dialog.component.scss'],
  standalone: false,
})
export class FyDeleteDialogComponent implements OnInit {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() deleteMethod: () => Observable<any>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() header: string;

  readonly body = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() infoMessage: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() ctaText: string;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() ctaLoadingText: string;

  readonly disableDelete = input(false);

  deleteCallInProgress = false;

  get LoaderPosition() {
    return LoaderPosition;
  }

  ngOnInit() {}

  cancel() {
    if (!this.deleteCallInProgress) {
      this.popoverController.dismiss();
    }
  }

  delete() {
    if (!this.disableDelete()) {
      this.deleteCallInProgress = true;
      this.deleteMethod()
        .pipe(
          map((res) => ({ status: 'success' })),
          catchError(() =>
            of({
              status: 'error',
            }),
          ),
          finalize(() => (this.deleteCallInProgress = false)),
        )
        .subscribe((res) => {
          this.popoverController.dismiss(res);
        });
    }
  }
}
