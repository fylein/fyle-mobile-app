import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { CardStatus } from 'src/app/core/enums/card-status.enum';

@Component({
  selector: 'app-virtual-card',
  templateUrl: './virtual-card.component.html',
  styleUrls: ['./virtual-card.component.scss'],
})
export class VirtualCardComponent {
  @Input() cardNumber: string = '123451234512345';

  @Input() cvv: string = '123';

  @Input() expiry: string = '2024-04-04';

  @Input() cardStatus: CardStatus = CardStatus.ACTIVE;

  @Input() availableAmount?: number = 1000;

  @Input() cardNickname: string = 'Nickname';

  showCardNumber: boolean = false;

  showCvv: boolean = false;

  constructor(
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  showToastMessage(message: string): void {
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }, 'check-circle-outline'),
      panelClass: 'msb-success',
    });
  }

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
    this.showToastMessage('Copied Successfully!');
  }

  hideCvvAndCopy() {
    this.showCvv = false;
    this.copyToClipboard(this.cvv);
  }

  hideCardNumberAndCopy() {
    this.showCardNumber = false;
    this.copyToClipboard(this.cardNumber);
  }

  toggleShowCardNumber() {
    this.showCardNumber = !this.showCardNumber;
  }

  toggleShowCvv() {
    this.showCvv = !this.showCvv;
  }
}
