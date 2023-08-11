import { Observable } from 'rxjs';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';

export interface DeletePopoverParams {
  component: typeof FyDeleteDialogComponent;
  cssClass: string;
  backdropDismiss: boolean;
  componentProps: {
    header: string;
    body: string;
    infoMessage: string;
    deleteMethod: () => Observable<void>;
  };
}
