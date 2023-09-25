import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { MAX_FILE_SIZE } from 'src/app/core/constants';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
})
export class CameraOptionsPopupComponent implements OnInit {
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef<HTMLInputElement>;

  constructor(
    private popoverController: PopoverController,
    private fileService: FileService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    return;
  }

  closeClicked(): void {
    this.popoverController.dismiss();
  }

  async getImageFromPicture(): Promise<void> {
    this.trackingService.addAttachment({ Mode: 'Add Expense', Category: 'Camera' });
    this.popoverController.dismiss({ option: 'camera' });
  }

  async uploadFileCallback(file: File): Promise<void> {
    if (file?.size < MAX_FILE_SIZE) {
      const dataUrl = await this.fileService.readFile(file);
      this.popoverController.dismiss({
        type: file.type,
        dataUrl,
        actionSource: 'gallery_upload',
      });
    } else {
      this.closeClicked();

      if (file?.size > MAX_FILE_SIZE) {
        this.showSizeLimitExceededPopover();
      }
    }
  }

  async onChangeCallback(nativeElement: HTMLInputElement): Promise<void> {
    const file = nativeElement.files[0];
    this.uploadFileCallback(file);
  }

  async getImageFromImagePicker(): Promise<void> {
    const that = this;
    that.trackingService.addAttachment({ Mode: 'Add Expense', Category: 'Camera' });

    const nativeElement = that.fileUpload.nativeElement;

    nativeElement.onchange = async (): Promise<void> => {
      that.onChangeCallback(nativeElement);
    };

    nativeElement.click();
  }

  async showSizeLimitExceededPopover(): Promise<void> {
    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 5MB in size. Please reduce the file size and try again.',
        primaryCta: {
          text: 'OK',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }
}
