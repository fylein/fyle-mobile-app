import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent, ImageCropperModule } from 'ngx-image-cropper';
import { ModalController, Platform, IonicModule } from '@ionic/angular';
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
  standalone: true,
  imports: [IonicModule, MatIcon, ImageCropperModule],
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
    this.backButtonAction = this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.VERY_HIGH, () => {
      this.closeModal();
    });
  }

  ionViewWillLeave() {
    this.backButtonAction.unsubscribe();
  }
}
