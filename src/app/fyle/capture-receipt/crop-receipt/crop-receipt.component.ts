import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ModalController, Platform } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Subscription } from 'rxjs';

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
    private platform: Platform
  ) {}

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
    this.backButtonAction = this.platform.backButton.subscribeWithPriority(300, () => {
      this.closeModal();
    });
  }

  ionViewWillLeave() {
    this.backButtonAction.unsubscribe();
  }
}
