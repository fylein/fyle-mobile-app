import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { LoaderService } from 'src/app/core/services/loader.service';
import { finalize, from, map, raceWith, switchMap, timer } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
})
export class CameraOptionsPopupComponent implements OnInit {
  @Input() mode: string;

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef<HTMLInputElement>;

  constructor(
    private popoverController: PopoverController,
    private fileService: FileService,
    private trackingService: TrackingService,
    private loaderService: LoaderService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    return;
  }

  closeClicked(): void {
    this.popoverController.dismiss();
  }

  async getImageFromPicture(): Promise<void> {
    const mode = this.mode === 'edit' ? 'Edit Expense' : 'Add Expense';
    this.trackingService.addAttachment({ Mode: mode, Category: 'Camera' });
    this.popoverController.dismiss({ option: 'camera' });
  }

  async uploadFileCallback(file: File): Promise<void> {
    if (file?.size < MAX_FILE_SIZE) {
      const fileRead$ = from(this.fileService.readFile(file));
      const delayedLoader$ = timer(300).pipe(
        switchMap(() =>
          from(this.loaderService.showLoader(this.translocoService.translate('cameraOptionsPopup.loaderMessage'), 5000))
        ),
        switchMap(() => fileRead$) // switch to fileRead$ after showing loader
      );

      // Use race to show loader only if fileRead$ takes more than 300ms.
      fileRead$
        .pipe(
          raceWith(delayedLoader$),
          map((dataUrl) => {
            this.popoverController.dismiss({
              type: file.type,
              dataUrl,
              actionSource: 'gallery_upload',
            });
          }),
          finalize(() => this.loaderService.hideLoader())
        )
        .subscribe();
    } else {
      this.closeClicked();

      if (file?.size > MAX_FILE_SIZE) {
        this.showSizeLimitExceededPopover(MAX_FILE_SIZE);
      }
    }
  }

  async onChangeCallback(nativeElement: HTMLInputElement): Promise<void> {
    const file = nativeElement.files[0];
    this.uploadFileCallback(file);
  }

  async getImageFromImagePicker(): Promise<void> {
    const that = this;
    const mode = this.mode === 'edit' ? 'Edit Expense' : 'Add Expense';
    this.trackingService.addAttachment({ Mode: mode, Category: 'Camera' });

    const nativeElement = that.fileUpload.nativeElement;

    nativeElement.onchange = async (): Promise<void> => {
      that.onChangeCallback(nativeElement);
    };

    nativeElement.click();
  }

  async showSizeLimitExceededPopover(maxFileSize: number): Promise<void> {
    const title: string = this.translocoService.translate('cameraOptionsPopup.sizeLimitExceededTitle');
    const message: string = this.translocoService.translate('cameraOptionsPopup.sizeLimitExceededMessage', {
      maxFileSize: (maxFileSize / (1024 * 1024)).toFixed(0),
    });
    const okText: string = this.translocoService.translate('cameraOptionsPopup.ok');

    const sizeLimitExceededPopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: okText,
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await sizeLimitExceededPopover.present();
  }
}
