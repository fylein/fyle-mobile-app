import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PersonalCard } from 'src/app/core/models/personal_card.model';
import { PopoverController } from '@ionic/angular';
import { PopupAlertComponentComponent } from '../../popup-alert-component/popup-alert-component.component';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../../core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { DeleteButtonComponent } from './delete-button/delete-button-component';
@Component({
  selector: 'app-bank-account-card',
  templateUrl: './bank-account-card.component.html',
  styleUrls: ['./bank-account-card.component.scss'],
})
export class BankAccountCardComponent implements OnInit {
  @Input() accountDetails: PersonalCard;

  @Output() deleted = new EventEmitter();

  constructor(
    private personalCardsService: PersonalCardsService,
    private loaderService: LoaderService,
    private popoverController: PopoverController,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ngOnInit(): void {}

  async presentPopover(ev: any) {
    const deletecardPopOver = await this.popoverController.create({
      component: DeleteButtonComponent,
      cssClass: 'delete-button-class',
      event: ev,
    });
    await deletecardPopOver.present();

    const { data } = await deletecardPopOver.onDidDismiss();

    if (data === 'delete') {
      this.confirmPopup();
    }
  }

  async deleteAccount() {
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

  async confirmPopup() {
    const deletecardPopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title: 'Are you sure',
        message: 'Are you sure to delete this card?',
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

    await deletecardPopOver.present();

    const { data } = await deletecardPopOver.onWillDismiss();

    if (data && data.action === 'delete') {
      this.deleteAccount();
    }
  }
}
