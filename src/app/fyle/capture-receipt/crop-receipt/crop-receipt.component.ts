import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';

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

  // @ViewChild('imageCropper') imageRef: ElementRef;

  constructor(private modalController: ModalController, private loaderService: LoaderService) {}

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

  rotate() {
    const img = this.imageCropper.wrapper.nativeElement.getElementsByTagName('img')[0];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(0.5 * Math.PI);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    img.src = canvas.toDataURL('image/png');
    this.base64ImageWithSource.base64Image = canvas.toDataURL('image/png');
  }
}
