import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource, CameraDirection } from '@capacitor/core';
const { Camera } = Plugins;
import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from '../../../core/services/tracking.service';

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
    private trackingService: TrackingService
  ) {}

  ngOnInit() {}

  closeClicked() {
    this.popoverController.dismiss();
  }

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
