import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-fy-view-attachment',
  templateUrl: './fy-view-attachment.component.html',
  styleUrls: ['./fy-view-attachment.component.scss'],
})
export class FyViewAttachmentComponent implements OnInit {
  @Input() attachments: FileObject[];

  @Input() isMileageExpense: boolean;

  @Input() canEdit: boolean;

  @ViewChild('swiper', { static: false }) imageSlides?: SwiperComponent;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderOptions: any;

  activeIndex = 0;

  zoomScale: number;

  // max params shouldnt effect constructors
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService,
    private trackingService: TrackingService,
    private spenderFileService: SpenderFileService
  ) {}

  ngOnInit(): void {
    this.zoomScale = 1;
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };

    this.attachments.forEach((attachment) => {
      if (attachment.type === 'pdf') {
        this.sanitizer.bypassSecurityTrustUrl(attachment.url);
      }
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
        title: 'Remove receipt',
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
}
