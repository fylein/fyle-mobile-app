import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { PopoverController } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoaderPosition } from '../../directive/loader-position.enum';

@Component({
  selector: 'app-fy-delete-dialog',
  templateUrl: './fy-delete-dialog.component.html',
  styleUrls: ['./fy-delete-dialog.component.scss'],
})
export class FyDeleteDialogComponent implements OnInit {
  @Input() deleteMethod: () => Observable<any>;

  @Input() header: string;

  @Input() body: string;

  @Input() infoMessage: string;

  @Input() ctaText: string;

  @Input() ctaLoadingText: string;

  @Input() disableDeleteButton = false;

  deleteCallInProgress = false;

  get LoaderPosition() {
    return LoaderPosition;
  }

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  cancel() {
    if (!this.deleteCallInProgress) {
      this.popoverController.dismiss();
    }
  }

  delete() {
    if (!this.disableDeleteButton) {
      this.deleteCallInProgress = true;
      this.deleteMethod()
        .pipe(
          map((res) => ({ status: 'success' })),
          catchError(() =>
            of({
              status: 'error',
            })
          ),
          finalize(() => (this.deleteCallInProgress = false))
        )
        .subscribe((res) => {
          this.popoverController.dismiss(res);
        });
    } else {
      this.cancel();
    }
  }
}
