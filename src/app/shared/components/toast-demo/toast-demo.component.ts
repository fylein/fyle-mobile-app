import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonIcon } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';

interface ToastExample {
  type: 'success' | 'failure' | 'information';
  message: string;
  redirectionText?: string;
  description: string;
  icon?: string;
  panelClass: string[];
}

@Component({
  selector: 'app-toast-demo',
  templateUrl: './toast-demo.component.html',
  styleUrls: ['./toast-demo.component.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonIcon,
    TranslocoPipe
  ],
})
export class ToastDemoComponent {
  private matSnackBar = inject(MatSnackBar);
  private snackbarProperties = inject(SnackbarPropertiesService);

  allToasts: ToastExample[] = [
    // Success Toasts
    {
      type: 'success',
      message: '1 card successfully added to Fyle!',
      description: 'Personal card linking - single card',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: '2 cards successfully added to Fyle!',
      description: 'Personal card linking - multiple cards',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Password changed successfully',
      description: 'Password change confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Opted-out of text messages successfully',
      description: 'Text message opt-out confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Report name changed successfully.',
      description: 'Report name update confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Your expense was split successfully. All the split expenses were added to the report',
      description: 'Expense split confirmation',
      panelClass: ['msb-success-with-camera-icon-for-split-exp']
    },
    {
      type: 'success',
      message: 'Receipt added to expense successfully',
      description: 'Receipt attachment confirmation',
      panelClass: ['msb-success-with-camera-icon']
    },
    {
      type: 'success',
      message: 'Expenses added to a new report',
      description: 'Expense report creation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: '1 Transaction successfully hidden!',
      description: 'Transaction hiding - single',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: '2 Transactions successfully hidden!',
      description: 'Transaction hiding - multiple',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Report Sent Back successfully',
      description: 'Report rejection confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Profile saved successfully',
      description: 'Profile update confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Mobile number copied successfully',
      description: 'Mobile number copy confirmation',
      panelClass: ['msb-success']
    },
    {
      type: 'success',
      message: 'Commute Details updated successfully!',
      description: 'Commute preferences update',
      panelClass: ['msb-success']
    },

    // Failure Toasts
    {
      type: 'failure',
      message: 'Something went wrong. Please try after some time.',
      description: 'Generic error message',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Please enter a valid name',
      description: 'Form validation error - name',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Please enter a valid password',
      description: 'Form validation error - password',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Invalid credentials. Please check your login details.',
      description: 'Authentication failure',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Failed to link card. Please try again.',
      description: 'Card linking failure',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Unable to save expense. Please check your connection.',
      description: 'Expense saving failure',
      panelClass: ['msb-failure']
    },
    {
      type: 'failure',
      message: 'Report submission failed. Please try again.',
      description: 'Report submission failure',
      panelClass: ['msb-failure']
    },

    // Information Toasts
    {
      type: 'information',
      message: 'Bulk mode is now active. You can capture multiple receipts.',
      description: 'Bulk receipt capture mode',
      panelClass: ['msb-bulkfyle-prompt']
    },
    {
      type: 'information',
      message: 'Your expense has been saved as draft.',
      description: 'Draft saving notification',
      panelClass: ['msb-info']
    },
    {
      type: 'information',
      message: 'New features are available. Check them out!',
      description: 'Feature announcement',
      panelClass: ['msb-info']
    },
    {
      type: 'information',
      message: 'Your session will expire in 5 minutes.',
      description: 'Session timeout warning',
      panelClass: ['msb-info']
    },
    {
      type: 'information',
      message: 'Receipt processing may take a few minutes.',
      description: 'Processing time expectation',
      panelClass: ['msb-info']
    },
    {
      type: 'information',
      message: 'You have unsaved information that will be lost if you discard this expense.',
      description: 'Unsaved changes warning',
      panelClass: ['msb-info']
    }
  ];

  showToast(toast: ToastExample): void {
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(toast.type, {
        message: toast.message,
        redirectionText: toast.redirectionText
      }, toast.icon),
      panelClass: toast.panelClass,
    });
  }

  getToastCount(type: 'success' | 'failure' | 'information'): number {
    return this.allToasts.filter(toast => toast.type === type).length;
  }
}
