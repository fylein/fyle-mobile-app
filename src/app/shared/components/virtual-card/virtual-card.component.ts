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
export class VirtualCardComponent implements OnInit {
  @Input() cardNumber: string;

  @Input() cvv: string;

  @Input() expiry: string;

  @Input() cardStatus: CardStatus;

  @Input() availableAmount?: number;

  @Input() cardNickname: string;

  CardStatus: typeof CardStatus = CardStatus;

  showCardNumber: boolean = false;

  showCvv: boolean = false;

  showSuccessStatusDot: boolean;

  showErrorStatusDot: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
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

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
    this.showToastMessage('Copied Successfully!');
  }

  ngOnInit(): void {
    this.showErrorStatusDot = this.cardStatus !== CardStatus.ACTIVE && this.cardStatus !== CardStatus.PREACTIVE;
    this.showSuccessStatusDot = this.cardStatus === CardStatus.ACTIVE || this.cardStatus === CardStatus.PREACTIVE;
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
