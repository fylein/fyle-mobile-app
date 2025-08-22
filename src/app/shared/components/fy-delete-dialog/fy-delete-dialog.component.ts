import { Component, OnInit, inject } from '@angular/core';
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

  deleteMethod: () => Observable<() => void>;

  header: string;

  body: string;

  infoMessage: string;

  ctaText: string;

  ctaLoadingText: string;

  disableDelete = false;

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
    if (!this.disableDelete) {
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
