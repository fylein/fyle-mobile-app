import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PlatformPersonalCard } from 'src/app/core/models/platform/platform-personal-card.model';
import { PopoverController } from '@ionic/angular';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarPropertiesService } from '../../../../core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { DeleteButtonComponent } from './delete-button/delete-button-component';
import { DateService } from 'src/app/core/services/date.service';
@Component({
  selector: 'app-bank-account-card',
  templateUrl: './bank-account-card.component.html',
  styleUrls: ['./bank-account-card.component.scss'],
})
export class BankAccountCardComponent implements OnInit {
  @Input() accountDetails: PlatformPersonalCard;

  @Input() minimal: boolean;

  @Output() deleted = new EventEmitter();

  lastSyncedAt;

  deleteCardPopOver;

  constructor(
    private personalCardsService: PersonalCardsService,
    private loaderService: LoaderService,
    private popoverController: PopoverController,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private dateService: DateService
  ) {}

  ngOnInit(): void {
    if (this.accountDetails.yodlee_last_synced_at) {
      this.lastSyncedAt = this.dateService.convertUTCDateToLocalDate(
        new Date(this.accountDetails.yodlee_last_synced_at)
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
    from(this.loaderService.showLoader('Deleting your card...', 5000))
      .pipe(
        switchMap(() => this.personalCardsService.deleteAccount(this.accountDetails.id)),
        finalize(async () => {
          await this.loaderService.hideLoader();
          const message = 'Card successfully deleted.';
          this.matSnackBar.openFromComponent(ToastMessageComponent, {
            ...this.snackbarProperties.setSnackbarProperties('success', { message }),
            panelClass: ['msb-success'],
          });
        })
      )
      .subscribe(() => this.deleted.emit());
  }

  async confirmPopup(): Promise<void> {
    const deleteCardPopOver = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Delete Card',
        message: `Are you sure want to delete this card <b> (${this.accountDetails.bank_name} ${this.accountDetails.card_number}) </b>?`,
        primaryCta: {
          text: 'Delete',
          action: 'delete',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
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
