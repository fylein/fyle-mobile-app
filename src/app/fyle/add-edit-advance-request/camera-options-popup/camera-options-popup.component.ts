import { Component, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';

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
    private fileService: FileService
  ) {}

  ngOnInit() {}

  async closeClicked() {
    await this.popoverController.dismiss();
  }

  async getImageFromPicture() {
    const image = await Camera.getPhoto({
      quality: 70,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.DataUrl,
    });

    if (image) {
      await this.popoverController.dismiss({
        type: image.format,
        dataUrl: image.dataUrl,
      });
    } else {
      this.closeClicked();
    }
  }

  async getImageFromImagePicker() {
    const that = this;
    const nativeElement = this.fileUpload.nativeElement as HTMLInputElement;

    nativeElement.onchange = async () => {
      const file = nativeElement.files[0];

      if (file) {
        const dataUrl = await that.fileService.readFile(file);
        await that.popoverController.dismiss({
          type: file.type,
          dataUrl,
        });
      } else {
        await that.closeClicked();
      }
    };

    nativeElement.click();
  }
}
