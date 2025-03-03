import { Component, Input, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { CardStatus } from 'src/app/core/enums/card-status.enum';
import { PopoverController } from '@ionic/angular';
import { FyPopoverComponent } from '../fy-popover/fy-popover.component';

@Component({
  selector: 'app-virtual-card',
  templateUrl: './virtual-card.component.html',
  styleUrls: ['./virtual-card.component.scss'],
})
export class VirtualCardComponent implements OnInit {
  @Input() cardNumber: string;

  @Input() cvv: string;

  @Input() expiry: string;

  @Input() cardStatus: CardStatus;

  @Input() availableAmount?: number;

  @Input() cardNickname: string;

  CardStatus: typeof CardStatus = CardStatus;

  showCardNumber = false;

  showCvv = false;

  showSuccessStatusDot: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private popoverController: PopoverController
  ) {}

  showToastMessage(message: string): void {
    const successToastProperties = this.snackbarProperties.setSnackbarProperties(
      'success',
      { message },
      'check-circle-outline'
    );
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...successToastProperties,
      panelClass: 'msb-success',
    });
  }

  async copyToClipboard(contentToCopy: string): Promise<void> {
    await this.clipboardService.writeString(contentToCopy);
    this.showToastMessage('Copied Successfully!');
  }

  ngOnInit(): void {
    this.showSuccessStatusDot = [CardStatus.ACTIVE, CardStatus.PREACTIVE].some((a) => a === this.cardStatus);
  }

  openInfoPopup(): void {
    this.popoverController
      .create({
        component: FyPopoverComponent,
        componentProps: {
          title: 'Available monthly limit',
          message: 'Available limit on this card for the current month.',
        },
        cssClass: 'dialog-popover',
      })
      .then((popover) => {
        popover.present();
      });
  }

  hideCvvAndCopy(): void {
    setTimeout(() => {
      this.showCvv = false;
    }, 1000);

    this.copyToClipboard(this.cvv);
  }

  hideCardNumberAndCopy(): void {
    setTimeout(() => {
      this.showCardNumber = false;
    }, 1000);

    this.copyToClipboard(this.cardNumber);
  }

  toggleShowCardNumber(): void {
    this.showCardNumber = true;
  }

  toggleShowCvv(): void {
    this.showCvv = true;
  }
}
