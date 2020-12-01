import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource, CameraDirection } from '@capacitor/core';
const { Camera } = Plugins;
import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
})
export class CameraOptionsPopupComponent implements OnInit {

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  constructor(
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private fileService: FileService
  ) { }

  ngOnInit() { }

  closeClicked() {
    this.popoverController.dismiss();
  }

  async getImageFromPicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.DataUrl
    });

    if (image) {
      this.popoverController.dismiss({
        type: image.format,
        dataUrl: image.dataUrl
      });
    } else {
      this.closeClicked();
    }
  }

  async getImageFromImagePicker() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = async () => {
      const file = fileUpload.files[0];

      if (file) {
        const dataUrl = await this.fileService.readFile(file);
        this.popoverController.dismiss({
          type: file.type,
          dataUrl
        });
      } else {
        this.closeClicked();
      }
    };
    fileUpload.click();
  }
}
