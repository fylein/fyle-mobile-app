import { Component, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-camera-options-popup',
    templateUrl: './camera-options-popup.component.html',
    styleUrls: ['./camera-options-popup.component.scss'],
    imports: [MatIcon, TranslocoPipe],
})
export class CameraOptionsPopupComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: any;

  constructor(private popoverController: PopoverController, private fileService: FileService) {}

  ngOnInit() {}

  closeClicked() {
    this.popoverController.dismiss();
  }

  async getImageFromPicture() {
    this.popoverController.dismiss({ option: 'camera' });
  }

  async getImageFromImagePicker() {
    const that = this;
    const nativeElement = this.fileUpload.nativeElement as HTMLInputElement;

    nativeElement.onchange = async () => {
      const file = nativeElement.files[0];

      if (file) {
        const dataUrl = await that.fileService.readFile(file);
        that.popoverController.dismiss({
          type: file.type,
          dataUrl,
        });
      } else {
        that.closeClicked();
      }
    };

    nativeElement.click();
  }
}
