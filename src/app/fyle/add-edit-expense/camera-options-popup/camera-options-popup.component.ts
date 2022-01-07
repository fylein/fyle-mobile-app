import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource, CameraDirection } from '@capacitor/core';
const { Camera } = Plugins;
import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
})
export class CameraOptionsPopupComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: any;

  constructor(
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private fileService: FileService,
    private trackingService: TrackingService,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  closeClicked() {
    this.popoverController.dismiss();
  }

  async getImageFromPicture() {
    console.log('Click a Picture');
    this.trackingService.addAttachment({ Mode: 'Add Expense', Category: 'Camera' });

    return this.popoverController.dismiss({ option: 'camera' });

    // const captureReceiptModal = await this.modalController.create({
    //   component: CaptureReceiptComponent,
    //   componentProps: {
    //     isNewExpense: false,
    //   },
    // });

    // await captureReceiptModal.present();

    // const { data } = await captureReceiptModal.onWillDismiss();

    // const image = await Camera.getPhoto({
    //   quality: 70,
    //   source: CameraSource.Camera,
    //   direction: CameraDirection.Rear,
    //   resultType: CameraResultType.DataUrl,
    // });

    // if (data && data.dataUrl) {
    //   this.popoverController.dismiss({
    //     type: data.dataUrl.split(';')[0].split('/')[1],
    //     dataUrl: data.dataUrl,
    //     actionSource: 'camera',
    //   });
    // } else {
    //   this.closeClicked();
    // }
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
