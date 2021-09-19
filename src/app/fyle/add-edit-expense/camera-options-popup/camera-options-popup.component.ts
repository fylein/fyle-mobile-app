import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource, CameraDirection } from '@capacitor/core';
const { Camera } = Plugins;
import { from, noop } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ReceiptPreviewComponent } from '../../capture-receipt/receipt-preview/receipt-preview.component';
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { concatMap, finalize, reduce } from 'rxjs/operators';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
})
export class CameraOptionsPopupComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: any;
  isCameraShown: boolean;
  base64ImagesWithSource: any;
  modalController: any;
  router: any;

  constructor(
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private fileService: FileService,
    private trackingService: TrackingService,
    private imagePicker: ImagePicker
  ) {}

  ngOnInit() {
    this.isCameraShown = false;
  }

  closeClicked() {
    this.popoverController.dismiss();
  }

  // setUpAndStartCamera() {
  //   if (!this.isCameraShown) {
  //     const cameraPreviewOptions: CameraPreviewOptions = {
  //       position: 'rear',
  //       toBack: true,
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //       parent: 'cameraPreview',
  //     };

  //     CameraPreview.start(cameraPreviewOptions).then((res) => {
  //       this.isCameraShown = true;
  //       this.getFlashModes();
  //     });
  //   }
  // }

  // async stopCamera() {
  //   if (this.isCameraShown === true) {
  //     await CameraPreview.stop();
  //     this.isCameraShown = false;
  //   }
  // }

  

  galleryUpload() {
    this.trackingService.instafyleGalleryUploadOpened({});

    // this.stopCamera();
    this.imagePicker.hasReadPermission().then((permission) => {
      if (permission) {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 70,
        };
        // If android app start crashing then convert outputType to 0 to get file path and then convert it to base64 before upload to s3.
        from(this.imagePicker.getPictures(options)).subscribe(async (imageBase64Strings) => {
          if (imageBase64Strings.length > 0) {
            imageBase64Strings.forEach((base64String, key) => {
              const base64PictureData = 'data:image/jpeg;base64,' + base64String;
              this.base64ImagesWithSource.push({
                source: 'MOBILE_DASHCAM_GALLERY',
                base64Image: base64PictureData,
              });
            });

            const modal = await this.modalController.create({
              component: ReceiptPreviewComponent,
              componentProps: {
                base64ImagesWithSource: this.base64ImagesWithSource,
                mode: 'bulk',
              },
            });
            await modal.present();

            const { data } = await modal.onWillDismiss();
            if (data) {
              if (data.base64ImagesWithSource.length === 0) {
                this.base64ImagesWithSource = [];
                // this.setUpAndStartCamera();
              } 
              // else {
              //   this.addMultipleExpensesToQueue(this.base64ImagesWithSource)
              //     .pipe(finalize(() => this.router.navigate(['/', 'enterprise', 'my_expenses'])))
              //     .subscribe(noop);
              // }
            }
          }
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }

  // addMultipleExpensesToQueue(base64ImagesWithSource: Image[]) {
  //   return from(base64ImagesWithSource).pipe(
  //     concatMap((res: Image) => this.addExpenseToQueue(res)),
  //     reduce((acc, curr) => acc.concat(curr), [])
  //   );
  // }

  async getImageFromPicture() {
    this.trackingService.addAttachment({ Mode: 'Add Expense', Category: 'Camera' });

    const image = await Camera.getPhoto({
      quality: 70,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.DataUrl,
    });

    if (image) {
      this.popoverController.dismiss({
        type: image.format,
        dataUrl: image.dataUrl,
        actionSource: 'camera',
      });
    } else {
      this.closeClicked();
    }
  }

  async getImageFromImagePicker() {
    const that = this;
    that.trackingService.addAttachment({ Mode: 'Add Expense', Category: 'Camera' });

    const nativeElement = that.fileUpload.nativeElement as HTMLInputElement;

    nativeElement.onchange = async () => {
      const file = nativeElement.files[0];

      if (file) {
        const dataUrl = await that.fileService.readFile(file);
        that.popoverController.dismiss({
          type: file.type,
          dataUrl,
          actionSource: 'gallery_upload',
        });
      } else {
        that.closeClicked();
      }
    };

    nativeElement.click();
  }
}
