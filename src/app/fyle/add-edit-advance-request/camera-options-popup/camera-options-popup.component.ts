import { Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
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
  private popoverController = inject(PopoverController);

  private fileService = inject(FileService);

  readonly fileUpload = viewChild<ElementRef<HTMLInputElement>>('fileUpload');

  ngOnInit() {}

  closeClicked() {
    this.popoverController.dismiss();
  }

  async getImageFromPicture() {
    this.popoverController.dismiss({ option: 'camera' });
  }

  async getImageFromImagePicker() {
    const that = this;
    const nativeElement = this.fileUpload().nativeElement;

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
