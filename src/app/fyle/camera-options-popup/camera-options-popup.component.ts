// component will be used only for android
import { Component, ElementRef, input, OnInit, viewChild, inject } from '@angular/core';
import { PopoverController } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { FileService } from 'src/app/core/services/file.service';
import { FilePickerService } from 'src/app/core/services/file-picker.service';
import { TrackingService } from '../../core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { LoaderService } from 'src/app/core/services/loader.service';
import { finalize, from, map, raceWith, switchMap, timer } from 'rxjs';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
  imports: [MatRipple, MatIcon, TranslocoPipe],
})
export class CameraOptionsPopupComponent implements OnInit {
  private popoverController = inject(PopoverController);

  private fileService = inject(FileService);

  private trackingService = inject(TrackingService);

  private loaderService = inject(LoaderService);

  private translocoService = inject(TranslocoService);

  private filePickerService = inject(FilePickerService);

  /** Label for tracking: 'Add Expense' | 'Edit Expense' | 'Add Advance Request' | 'Edit Advance Request' */
  readonly mode = input<string>();

  /** Show "Add more using" header when true (e.g. edit mode and a receipt is already present) */
  readonly showHeader = input<boolean>(false);

  readonly fileUpload = viewChild<ElementRef<HTMLInputElement>>('fileUpload');

  ngOnInit(): void {
    return;
  }

  closeClicked(): void {
    this.popoverController.dismiss();
  }

  async getImageFromPicture(): Promise<void> {
    this.trackingService.addAttachment({ Mode: this.mode(), Category: 'Camera' });
    this.popoverController.dismiss({ option: 'camera' });
  }

  async uploadFileCallback(file: Blob): Promise<void> {
    if (file?.size < MAX_FILE_SIZE) {
      const fileRead$ = from(this.fileService.readFile(file));
      const delayedLoader$ = timer(300).pipe(
        switchMap(() =>
          from(
            this.loaderService.showLoader(this.translocoService.translate('cameraOptionsPopup.loaderMessage'), 5000),
          ),
        ),
        switchMap(() => fileRead$), // switch to fileRead$ after showing loader
      );

      // Use race to show loader only if fileRead$ takes more than 300ms.
      fileRead$
        .pipe(
          raceWith(delayedLoader$),
          map((dataUrl) => {
            this.popoverController.dismiss({ dataUrl, type: this.fileService.getImageTypeFromDataUrl(dataUrl) });
          }),
          finalize(() => this.loaderService.hideLoader()),
        )
        .subscribe();
    } else {
      this.closeClicked();

      if (file?.size > MAX_FILE_SIZE) {
        this.showSizeLimitExceededPopover(MAX_FILE_SIZE);
      }
    }
  }

  async getFileFromFilePicker(): Promise<void> {
    this.trackingService.addAttachment({ Mode: this.mode(), Category: 'Upload File' });
    if (Capacitor.isNativePlatform()) {
      await this.pickAndUpload(['application/pdf'], 'Upload File');
    } else {
      this.triggerFileInput('application/pdf');
    }
  }

  async getImageFromImagePicker(): Promise<void> {
    this.trackingService.addAttachment({ Mode: this.mode(), Category: 'Upload Image' });
    if (Capacitor.isNativePlatform()) {
      await this.pickAndUpload(['image/*'], 'Upload Image');
    } else {
      this.triggerFileInput('image/*');
    }
  }

  private triggerFileInput(accept: string): void {
    const input = this.fileUpload()?.nativeElement;
    if (!input) return;
    input.accept = accept;
    input.onchange = (): void => {
      const file = input.files?.[0];
      if (file) {
        this.uploadFileCallback(file);
      }
      input.value = '';
      input.onchange = null;
    };
    input.click();
  }

  private async pickAndUpload(mimes: string[], category: string): Promise<void> {
    try {
      const result = await this.filePickerService.pick({
        multiple: false,
        mimes,
      });

      const picked = result.files?.[0];
      if (!picked) {
        return;
      }

      const blob = await this.pickedFileToBlob(picked);
      await this.uploadFileCallback(blob);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.trackingService.filePickerError({ Mode: this.mode(), Category: category, error });
      // User cancelled or picker failed – no-op, popover stays open
    }
  }

  private async pickedFileToBlob(picked: {
    path: string;
    webPath: string;
  }): Promise<Blob> {
    const url = picked.webPath ?? Capacitor.convertFileSrc(picked.path);
    const response = await fetch(url);
    return response.blob();
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
