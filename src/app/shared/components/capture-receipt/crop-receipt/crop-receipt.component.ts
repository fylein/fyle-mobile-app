import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ModalController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Subscription } from 'rxjs';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { Router } from '@angular/router';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DocumentNormalizer } from 'capacitor-plugin-dynamsoft-document-normalizer';
import { CropImageComponent } from '../crop-image/crop-image.component';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Component({
  selector: 'app-crop-receipt',
  templateUrl: './crop-receipt.component.html',
  styleUrls: ['./crop-receipt.component.scss'],
})
export class CropReceiptComponent implements OnInit {
  @Input() base64ImageWithSource: Image;

  @ViewChild('imageCropper') imageCropper: ImageCropperComponent;

  backButtonAction: Subscription;

  constructor(
    private modalController: ModalController,
    private loaderService: LoaderService,
    private platform: Platform,
    private router: Router
  ) {
    let license =
      'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=='; // public trial
    DocumentNormalizer.initLicense({ license: license });
    DocumentNormalizer.initialize();
  }
  async scan() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
    });
    if (image) {
      const cropReceiptModal = await this.modalController.create({
        component: CropImageComponent,
        componentProps: {
          image: image,
        },
      });
      await cropReceiptModal.present();
    }
  }

  ngOnInit() {
    this.loaderService.showLoader();
  }

  cropReceipt() {
    this.base64ImageWithSource.base64Image = this.imageCropper.crop().base64;
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
