import { Observable } from 'rxjs';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';

export interface ExpenseDeletePopoverParams {
  component: typeof FyDeleteDialogComponent;
  cssClass: string;
  backdropDismiss: boolean;
  componentProps: {
    header: string;
    body: string;
    infoMessage: string;
    ctaText: string;
    ctaLoadingText: string;
    deleteMethod: () => Observable<void>;
  };
}
