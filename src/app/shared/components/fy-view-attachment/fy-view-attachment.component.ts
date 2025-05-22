import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, of, forkJoin } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { OverlayEventDetail } from '@ionic/core';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ActivatedRoute } from '@angular/router';
import { PlatformFile } from 'src/app/core/models/platform/platform-file.model';

@Component({
  selector: 'app-fy-view-attachment',
  templateUrl: './fy-view-attachment.component.html',
  styleUrls: ['./fy-view-attachment.component.scss'],
})
export class FyViewAttachmentComponent implements OnInit {
  @Input() attachments: FileObject[];

  @Input() isMileageExpense: boolean;

  @Input() canEdit: boolean;

  @Input() expenseId: string;

  @Output() addMoreAttachments = new EventEmitter<Event>();

  @ViewChild('swiper', { static: false }) imageSlides?: SwiperComponent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderOptions: any;

  activeIndex = 0;

  zoomScale: number;

  loading = true;

  rotatingDirection: 'left' | 'right' | null = null;

  isImageDirty: boolean[] = [];

  saving = false;

  saveComplete = false;

  // max params shouldnt effect constructors
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService,
    private trackingService: TrackingService,
    private spenderFileService: SpenderFileService,
    private expensesService: ExpensesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.zoomScale = 1;
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };

    // convert all image attachments to base64 before allowing interaction
    const conversionObservables = this.attachments.map((attachment) => {
      if (
        attachment.type === 'image' &&
        typeof attachment.url === 'string' &&
        !attachment.url.startsWith('data:image/')
      ) {
        return from(
          fetch(attachment.url, { mode: 'cors' })
            .then((response) => response.blob())
            .then(
              (blob) =>
                new Promise<string>((resolve: (value: string) => void, reject): void => {
                  const reader = new FileReader();
                  reader.onloadend = (): void => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                })
            )
            .then((base64Url) => {
              attachment.url = base64Url;
              attachment.thumbnail = base64Url;
            })
        );
      } else {
        if (attachment.type === 'pdf') {
          this.sanitizer.bypassSecurityTrustUrl(attachment.url);
        }
        return of(null);
      }
    });
    forkJoin(conversionObservables).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ionViewWillEnter(): void {
    this.imageSlides.swiperRef.update();
  }

  zoomIn(): void {
    this.zoomScale += 0.25;
  }

  zoomOut(): void {
    this.zoomScale -= 0.25;
  }

  resetZoom(): void {
    this.zoomScale = 1;
  }

  onDoneClick(): void {
    this.modalController.dismiss({ attachments: this.attachments });
  }

  addAttachments(event: Event): void {
    this.modalController.dismiss({ action: 'addMoreAttachments', event });
  }

  goToNextSlide(): void {
    this.imageSlides.swiperRef.slideNext();
  }

  goToPrevSlide(): void {
    this.imageSlides.swiperRef.slidePrev();
  }

  getActiveIndex(): void {
    this.activeIndex = this.imageSlides.swiperRef.activeIndex;
  }

  async deleteAttachment(): Promise<void> {
    const activeIndex = await this.imageSlides.swiperRef.activeIndex;
    try {
      this.trackingService.deleteFileClicked({ 'File ID': this.attachments[activeIndex].id });
    } catch (error) {}
    const deletePopover = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Remove Receipt',
        message: 'Are you sure you want to remove this receipt?',
        primaryCta: {
          text: 'Remove',
          action: 'remove',
          type: 'alert',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await deletePopover.present();
    const response: OverlayEventDetail<{ action: string }> = await deletePopover.onWillDismiss();
    const data = response.data;

    if (data?.action === 'remove') {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => {
            if (this.attachments[activeIndex].id) {
              return this.spenderFileService.deleteFilesBulk([this.attachments[activeIndex].id]);
            } else {
              return of(null);
            }
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(() => {
          try {
            this.trackingService.fileDeleted({ 'File ID': this.attachments[activeIndex].id });
          } catch (error) {}
          this.attachments.splice(activeIndex, 1);
          if (this.attachments.length === 0) {
            this.modalController.dismiss({ attachments: this.attachments });
          } else {
            if (activeIndex > 0) {
              this.goToPrevSlide();
            } else {
              this.goToNextSlide();
            }
          }
        });
    }
  }

  async rotateAttachment(direction: 'left' | 'right'): Promise<void> {
    if (this.loading || this.rotatingDirection) {
      return;
    }
    const currentAttachment = this.attachments[this.activeIndex];
    if (!currentAttachment || currentAttachment.type === 'pdf') {
      return;
    }
    this.rotatingDirection = direction;
    setTimeout(() => {
      const imageToBeRotated = new window.Image();
      imageToBeRotated.src = currentAttachment.url;
      imageToBeRotated.onload = (): void => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.rotatingDirection = null;
          return;
        }
        canvas.width = imageToBeRotated.height;
        canvas.height = imageToBeRotated.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(((direction === 'left' ? -90 : 90) * Math.PI) / 180);
        ctx.drawImage(imageToBeRotated, -imageToBeRotated.width / 2, -imageToBeRotated.height / 2);
        this.attachments[this.activeIndex] = {
          ...currentAttachment,
          url: canvas.toDataURL('image/jpeg', 0.9),
          thumbnail: canvas.toDataURL('image/jpeg', 0.9),
        };
        this.rotatingDirection = null;
        this.isImageDirty[this.activeIndex] = true;
      };
    }, 400);
  }

  /**
   * Saves the rotated image by deleting the old file (if any) and uploading the new one.
   * Shows a loader while saving and updates the attachment in the array.
   */
  //TODO - Rishabh: Refactor this function to reduce complexity
  // eslint-disable-next-line complexity
  async saveRotatedImage(): Promise<void> {
    this.saving = true;
    this.saveComplete = false;
    const attachment = this.attachments[this.activeIndex];
    let fileObj: PlatformFile | undefined;
    try {
      const result = await this.spenderFileService
        .createFile({
          name: attachment.name || 'rotated-receipt.jpg',
          type: 'RECEIPT',
        })
        .toPromise();
      if (!result || typeof result !== 'object' || !('upload_url' in result) || !('id' in result)) {
        throw new Error('Invalid file object returned from createFile');
      }
      fileObj = result;
    } catch (e) {
      this.saving = false;
      return;
    }
    // Convert base64 data URL to Blob
    const dataUrl = attachment.url;
    let blob: Blob;
    try {
      const fetchedBlob = await fetch(dataUrl).then((res) => res.blob());
      if (!fetchedBlob || !(fetchedBlob instanceof Blob) || fetchedBlob.size === 0) {
        throw new Error('Rotated image content is empty');
      }
      blob = fetchedBlob;
    } catch (e) {
      this.saving = false;
      // Handle error (show toast, etc.)
      return;
    }

    // Upload the Blob to S3 using the pre-signed URL
    try {
      if (!fileObj.upload_url) {
        throw new Error('No upload_url found in file object');
      }
      await fetch(fileObj.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: blob,
      });
    } catch (e) {
      this.saving = false;
      // Handle error (show toast, etc.)
      return;
    }

    // Attach the new file to the expense
    try {
      const expenseId = String(this.expenseId);
      const fileId = String(fileObj.id);
      await this.expensesService.attachReceiptToExpense(expenseId, fileId).toPromise();

      this.attachments[this.activeIndex] = {
        ...attachment,
        ...fileObj,
        url: fileObj.download_url ?? attachment.url,
        thumbnail: fileObj.download_url ?? attachment.url,
      };
    } catch (e) {
      // Handle error (show toast, etc.)
    }

    // Delete old image if it has an ID
    if (attachment.id) {
      try {
        await this.spenderFileService.deleteFilesBulk([attachment.id]).toPromise();
      } catch (e) {
        // Handle delete error if needed
      }
    }

    this.isImageDirty[this.activeIndex] = false;
    this.saving = false;
    this.saveComplete = true;
    setTimeout(() => {
      this.saveComplete = false;
    }, 5000);
  }
}
