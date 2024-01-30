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

  @Input() cvv?: string;

  @Input() expiry: Date;

  @Input() cardStatus: CardStatus;

  @Input() availableAmount?: number;

  CardStatus: typeof CardStatus = CardStatus;

  showCardNumber: boolean = false;

  showCvv: boolean = false;

  constructor(
    private clipboardService: ClipboardService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ngOnInit(): void {}
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
}
