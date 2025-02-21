import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';

interface ListItems {
  icon: string;
  text: string;
  textToCopy?: string;
}

@Component({
  selector: 'app-popup-with-bullets',
  templateUrl: './popup-with-bullets.component.html',
  styleUrls: ['./popup-with-bullets.component.scss'],
})
export class PopupWithBulletsComponent {
  @Input() title: string;

  @Input() listHeader: string;

  @Input() listItems: ListItems[];

  @Input() ctaText: string;

  constructor(
    private popoverController: PopoverController,
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  dismissPopover(): void {
    this.popoverController.dismiss();
  }

  async copyToClipboard(textToCopy: string): Promise<void> {
    this.clipboardService.writeString(textToCopy);
    this.showToastMessage('Phone Number Copied Successfully');
  }

  showToastMessage(message: string): void {
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }, 'check-circle-outline'),
      panelClass: 'msb-success',
    });
  }
}
