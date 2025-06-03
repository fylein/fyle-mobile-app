import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, of, forkJoin } from 'rxjs';
import { switchMap, finalize, tap } from 'rxjs/operators';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { OverlayEventDetail } from '@ionic/core';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'src/app/core/services/file.service';
import { RotationDirection } from 'src/app/core/enums/rotation-direction.enum';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';

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

  saving = false;

  rotatingDirection: RotationDirection | null = null;

  isImageDirty: { [key: number]: boolean } = {};

  saveComplete: { [key: number]: boolean } = {};

  RotationDirection = RotationDirection; // Make enum available in template

  // max params shouldnt effect constructors
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService,
    private trackingService: TrackingService,
    private spenderFileService: SpenderFileService,
    private expensesService: ExpensesService,
    private activatedRoute: ActivatedRoute,
    private fileService: FileService,
    private transactionsOutboxService: TransactionsOutboxService
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
        return from(fetch(attachment.url)).pipe(
          switchMap((response: Response) => from(response.blob())),
          switchMap((blob: Blob) => from(this.fileService.readFile(blob))),
          tap((base64Url: string) => {
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

    forkJoin(conversionObservables)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
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

  async rotateAttachment(direction: RotationDirection): Promise<void> {
    if (this.loading || this.rotatingDirection) {
      return;
    }
    const currentAttachment = this.attachments[this.activeIndex];
    if (!currentAttachment) {
      return;
    }
    this.saveComplete[this.activeIndex] = false;
    this.rotatingDirection = direction;
    setTimeout(() => {
      this.rotateImage(currentAttachment, direction);
    }, 400);
  }

  saveRotatedImage(): void {
    this.saving = true;
    this.saveComplete[this.activeIndex] = false;

    const attachment = this.attachments[this.activeIndex];
    const currentBase64Url = attachment.url;

    from(fetch(attachment.url).then((res) => res.blob()))
      .pipe(
        switchMap((blob: Blob) => {
          if (!blob || !(blob instanceof Blob) || blob.size === 0) {
            throw new Error('Rotated image content is empty');
          }

          return this.fileService.uploadUrl(attachment.id).pipe(
            switchMap((uploadUrl: string) => this.transactionsOutboxService.uploadData(uploadUrl, blob, 'image/jpeg')),
            tap(() => {
              this.attachments[this.activeIndex] = {
                ...attachment,
                url: currentBase64Url,
                thumbnail: currentBase64Url,
              };
            })
          );
        }),
        finalize(() => {
          this.saving = false;
          this.isImageDirty[this.activeIndex] = false;
          this.saveComplete[this.activeIndex] = true;
          setTimeout(() => {
            this.saveComplete[this.activeIndex] = false;
          }, 5000);
        })
      )
      .subscribe({
        error: () => {
          this.saving = false;
          this.isImageDirty[this.activeIndex] = true;
        },
      });
  }

  private rotateImage(attachment: FileObject, direction: RotationDirection): void {
    const imageToBeRotated = new window.Image();
    imageToBeRotated.crossOrigin = 'anonymous';
    imageToBeRotated.src = attachment.url;

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
      ctx.rotate(((direction === RotationDirection.LEFT ? -90 : 90) * Math.PI) / 180);
      ctx.drawImage(imageToBeRotated, -imageToBeRotated.width / 2, -imageToBeRotated.height / 2);

      const base64Url = canvas.toDataURL('image/jpeg', 0.9);
      this.attachments[this.activeIndex] = {
        ...attachment,
        url: base64Url,
        thumbnail: base64Url,
      };
      this.rotatingDirection = null;
      this.isImageDirty[this.activeIndex] = true;
    };

    imageToBeRotated.onerror = (): void => {
      this.rotatingDirection = null;
    };
  }
}
