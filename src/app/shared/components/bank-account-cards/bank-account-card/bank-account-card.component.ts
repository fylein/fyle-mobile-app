import { Component, Input, OnInit, inject, input, output } from '@angular/core';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { IonCol, IonGrid, IonIcon, IonRow, PopoverController } from '@ionic/angular/standalone';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../../core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { DeleteButtonComponent } from './delete-button/delete-button-component';
import { DateService } from 'src/app/core/services/date.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-bank-account-card',
  templateUrl: './bank-account-card.component.html',
  styleUrls: ['./bank-account-card.component.scss'],
  imports: [
    DatePipe,
    IonCol,
    IonGrid,
    IonIcon,
    IonRow,
    TranslocoPipe
  ],
})
export class BankAccountCardComponent implements OnInit {
  private personalCardsService = inject(PersonalCardsService);

  private loaderService = inject(LoaderService);

  private popoverController = inject(PopoverController);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  private dateService = inject(DateService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() accountDetails: PlatformPersonalCard;

  readonly minimal = input<boolean>(undefined);

  readonly deleted = output();

  lastSyncedAt;

  deleteCardPopOver;

  ngOnInit(): void {
    if (this.accountDetails.yodlee_last_synced_at) {
      this.lastSyncedAt = this.dateService.convertUTCDateToLocalDate(
        new Date(this.accountDetails.yodlee_last_synced_at),
      );
    }
  }

  async presentPopover(ev: PointerEvent): Promise<void> {
    const deleteCardPopOver = await this.popoverController.create({
      component: DeleteButtonComponent,
      cssClass: 'delete-button-class',
      event: ev,
    });
    await deleteCardPopOver.present();

    const { data } = await deleteCardPopOver.onDidDismiss<string>();

    if (data === 'delete') {
      this.confirmPopup();
    }
  }

  async deleteAccount(): Promise<void> {
    from(this.loaderService.showLoader(this.translocoService.translate('bankAccountCard.deletingCard'), 5000))
      .pipe(
        switchMap(() => this.personalCardsService.deleteAccount(this.accountDetails.id)),
        finalize(async () => {
          await this.loaderService.hideLoader();
          const message = this.translocoService.translate('bankAccountCard.cardDeletedSuccess');
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success'],
          });
        }),
      )
      .subscribe(() => this.deleted.emit());
  }

  async confirmPopup(): Promise<void> {
    const title = this.translocoService.translate('bankAccountCard.deleteCardTitle');
    const message = this.translocoService.translate('bankAccountCard.deleteConfirmationMessage', {
      accountInfo: `(${this.accountDetails.bank_name} ${this.accountDetails.card_number})`,
    });
    const primaryCta = {
      text: this.translocoService.translate('bankAccountCard.delete'),
      action: 'delete',
    };
    const secondaryCta = {
      text: this.translocoService.translate('bankAccountCard.cancel'),
      action: 'cancel',
    };

    const deleteCardPopOver = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta,
        secondaryCta,
      },
      cssClass: 'pop-up-in-center',
    });

    await deleteCardPopOver.present();

    const { data } = await deleteCardPopOver.onWillDismiss<{ action: string }>();

    if (data && data.action === 'delete') {
      this.deleteAccount();
    }
  }
}
