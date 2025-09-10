import { Component, Input, OnInit, inject, input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { CardStatus } from 'src/app/core/enums/card-status.enum';
import { PopoverController, IonicModule } from '@ionic/angular';
import { FyPopoverComponent } from '../fy-popover/fy-popover.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { NgClass, SlicePipe, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';

@Component({
  selector: 'app-virtual-card',
  templateUrl: './virtual-card.component.html',
  styleUrls: ['./virtual-card.component.scss'],
  imports: [NgClass, IonicModule, SlicePipe, TitleCasePipe, CurrencyPipe, DatePipe, TranslocoPipe, FyCurrencyPipe],
})
export class VirtualCardComponent implements OnInit {
  private clipboardService = inject(ClipboardService);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private popoverController = inject(PopoverController);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cardNumber: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cvv: string;

  readonly expiry = input<string>(undefined);

  readonly cardStatus = input<CardStatus>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() availableAmount?: number;

  readonly cardNickname = input<string>(undefined);

  CardStatus: typeof CardStatus = CardStatus;

  showCardNumber = false;

  showCvv = false;

  showSuccessStatusDot: boolean;

  showToastMessage(message: string): void {
    const successToastProperties = this.snackbarProperties.setSnackbarProperties(
      'success',
      { message },
      'check-circle-outline',
    );
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...successToastProperties,
      panelClass: 'msb-success',
    });
  }

  async copyToClipboard(contentToCopy: string): Promise<void> {
    await this.clipboardService.writeString(contentToCopy);
    this.showToastMessage(this.translocoService.translate('virtualCard.copiedSuccessfully'));
  }

  ngOnInit(): void {
    this.showSuccessStatusDot = [CardStatus.ACTIVE, CardStatus.PREACTIVE].some((a) => a === this.cardStatus());
  }

  openInfoPopup(): void {
    const title = this.translocoService.translate('virtualCard.availableMonthlyLimit');
    const message = this.translocoService.translate('virtualCard.availableLimitMessage');
    this.popoverController
      .create({
        component: FyPopoverComponent,
        componentProps: {
          title,
          message,
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
