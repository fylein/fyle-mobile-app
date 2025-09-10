import { Component, OnInit, Input, inject, viewChild } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonTitle, IonToolbar, ModalController, Platform } from '@ionic/angular/standalone';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Subscription } from 'rxjs';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { MatIcon } from '@angular/material/icon';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Component({
  selector: 'app-crop-receipt',
  templateUrl: './crop-receipt.component.html',
  styleUrls: ['./crop-receipt.component.scss'],
  imports: [
    ImageCropperComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatIcon
  ],
})
export class CropReceiptComponent implements OnInit {
  private modalController = inject(ModalController);

  private loaderService = inject(LoaderService);

  private platform = inject(Platform);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() base64ImageWithSource: Image;

  readonly imageCropper = viewChild<ImageCropperComponent>('imageCropper');

  backButtonAction: Subscription;

  ngOnInit() {
    this.loaderService.showLoader();
  }

  cropReceipt() {
    this.base64ImageWithSource.base64Image = this.imageCropper().crop().base64;
    this.modalController.dismiss({
      base64ImageWithSource: this.base64ImageWithSource,
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  imageLoaded() {
    this.loaderService.hideLoader();
  }

  ionViewWillEnter() {
    // Assigned a higher priority here so it will overwrite the backButtonAction in receipt-preview component
    // Ref - https://ionicframework.com/docs/developing/hardware-back-button#basic-usage
    this.backButtonAction = this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.VERY_HIGH, () => {
      this.closeModal();
    });
  }

  ionViewWillLeave() {
    this.backButtonAction.unsubscribe();
  }
}
