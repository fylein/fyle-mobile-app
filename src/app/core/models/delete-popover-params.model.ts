import { Observable } from 'rxjs';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { Expense } from './expense.model';

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
    deleteMethod: () => Observable<Expense>;
  };
}
