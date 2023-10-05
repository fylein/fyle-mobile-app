import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { AdvanceRequests } from './advance-requests.model';
import { Observable } from 'rxjs';

export interface AdvanceRequestDeleteParams {
  component: typeof FyDeleteDialogComponent;
  cssClass: string;
  backdropDismiss: boolean;
  componentProps: {
    header: string;
    body: string;
    deleteMethod: () => Observable<AdvanceRequests>;
  };
}
