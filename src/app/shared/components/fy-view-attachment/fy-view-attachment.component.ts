import { Component, OnInit, Input, ViewChild } from '@angular/core';
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

  @ViewChild('swiper', { static: false }) imageSlides?: SwiperComponent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderOptions: any;

  activeIndex = 0;

  zoomScale: number;

  loading = true;

  // Indicates the current rotation direction for animation ('left', 'right', or null)
  rotatingDirection: 'left' | 'right' | null = null;

  // Tracks which images have unsaved rotation changes
  isImageDirty: boolean[] = [];

  // Indicates if a save operation is in progress
  saving = false;

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

    // Use RxJS forkJoin to convert all image attachments to base64 before allowing interaction
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

  /**
   * Rotates the current image by 90 degrees in the specified direction.
   * The rotation happens in two steps:
   * 1. Visual rotation: Applies CSS transform immediately for smooth animation.
   * 2. Data rotation: After a 400ms animation, the actual image data is rotated using canvas.
   *
   * @param direction - Direction to rotate the image ('left' = -90°, 'right' = 90°).
   */
  async rotateAttachment(direction: 'left' | 'right'): Promise<void> {
    // Prevents multiple rotations at the same time.
    // If a rotation is already in progress, ignore further rotate requests until it's cleared.
    if (this.loading || this.rotatingDirection) {
      return;
    }
    const currentAttachment = this.attachments[this.activeIndex];
    if (!currentAttachment || currentAttachment.type === 'pdf') {
      return;
    }
    // Step 1: Visual rotation (CSS animation)
    this.rotatingDirection = direction;
    // Step 2: After animation, update the image data
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
        // Mark this image as dirty (needs saving)
        this.isImageDirty[this.activeIndex] = true;
      };
    }, 400); // Match this with the CSS transition duration
  }

  /**
   * Saves the rotated image by deleting the old file (if any) and uploading the new one.
   * Shows a loader while saving and updates the attachment in the array.
   */
  // eslint-disable-next-line complexity
  async saveRotatedImage(): Promise<void> {
    this.saving = true;
    const attachment = this.attachments[this.activeIndex];
    // 1. Request a pre-signed S3 upload URL
    let fileObj: PlatformFile | undefined;
    try {
      const result = await this.spenderFileService
        .createFile({
          name: attachment.name || 'rotated-receipt.jpg',
          type: 'RECEIPT',
        })
        .toPromise();
      // Type guard for fileObj
      if (!result || typeof result !== 'object' || !('upload_url' in result) || !('id' in result)) {
        throw new Error('Invalid file object returned from createFile');
      }
      fileObj = result ;
    } catch (e) {
      this.saving = false;
      // Handle error (show toast, etc.)
      return;
    }
    // 2. Convert base64 data URL to Blob
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

    // 3. Upload the Blob to S3 using the pre-signed URL
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

    // 4. Attach the new file to the expense
    try {
      const expenseId = String(this.expenseId);
      const fileId = String(fileObj.id);
      await this.expensesService.attachReceiptToExpense(expenseId, fileId).toPromise();

      // 5. Update the UI
      this.attachments[this.activeIndex] = {
        ...attachment,
        ...fileObj,
        url: fileObj.download_url ?? attachment.url,
        thumbnail: fileObj.download_url ?? attachment.url,
      };
    } catch (e) {
      // Handle error (show toast, etc.)
    }

    // 6. Delete old image if it has an ID
    if (attachment.id) {
      try {
        await this.spenderFileService.deleteFilesBulk([attachment.id]).toPromise();
      } catch (e) {
        // Handle delete error if needed
      }
    }

    this.isImageDirty[this.activeIndex] = false;
    this.saving = false;
  }
}
