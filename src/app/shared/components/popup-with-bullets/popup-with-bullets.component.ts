import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ListItem } from 'src/app/core/models/list-item.model';
import { TranslocoService } from '@jsverse/transloco';
import { NgClass } from '@angular/common';
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-popup-with-bullets',
    templateUrl: './popup-with-bullets.component.html',
    styleUrls: ['./popup-with-bullets.component.scss'],
    imports: [
        IonicModule,
        NgClass,
        MatRipple,
    ],
})
export class PopupWithBulletsComponent {
  @Input() title: string;

  @Input() listHeader: string;

  @Input() listItems: ListItem[];

  @Input() ctaText: string;

  constructor(
    private popoverController: PopoverController,
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private translocoService: TranslocoService
  ) {}

  dismissPopover(): void {
    this.popoverController.dismiss();
  }

  async copyToClipboard(textToCopy: string): Promise<void> {
    this.clipboardService.writeString(textToCopy);
    this.showToastMessage(this.translocoService.translate('popupWithBullets.phoneNumberCopied'));
  }

  showToastMessage(message: string): void {
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }, 'check-circle-outline'),
      panelClass: 'msb-success',
    });
  }
}
