import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PopupService } from 'src/app/core/services/popup.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { from, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';

@Component({
  selector: 'app-fy-view-attachment',
  templateUrl: './fy-view-attachment.component.html',
  styleUrls: ['./fy-view-attachment.component.scss'],
})
export class FyViewAttachmentComponent implements OnInit {
  @Input() attachments: any[];

  @Input() canEdit = false;

  @ViewChild('slides') imageSlides: any;

  sliderOptions: { initialSlide: number; slidesPerView: number; autoHeight: boolean; zoom: { maxRatio: number } };

  activeIndex: number;

  zoomScale: number;

  // max params shouldnt effect constructors
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private sanitizer: DomSanitizer,
    private popupService: PopupService,
    private loaderService: LoaderService,
    private fileService: FileService
  ) {}

  ngOnInit() {
    this.zoomScale = 0.5;
    this.sliderOptions = {
      initialSlide: 0,
      slidesPerView: 1,
      autoHeight: true,
      zoom: {
        maxRatio: 1,
      },
    };
    this.activeIndex = 0;

    this.attachments.forEach((attachment) => {
      if (attachment.type === 'pdf') {
        this.sanitizer.bypassSecurityTrustUrl(attachment.url);
      }
    });
  }

  zoomIn() {
    this.zoomScale += 0.25;
  }

  zoomOut() {
    this.zoomScale -= 0.25;
  }

  resetZoom() {
    this.zoomScale = 0.5;
  }

  onDoneClick() {
    this.modalController.dismiss({ attachments: this.attachments });
  }

  async goToNextSlide() {
    await this.imageSlides.slideNext();
    await this.imageSlides.update();
  }

  async goToPrevSlide() {
    await this.imageSlides.slidePrev();
    await this.imageSlides.update();
  }

  async ionSlideDidChange() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    this.activeIndex = activeIndex;
  }

  async deleteAttachment() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    const deletePopover = await this.popoverController.create({
      component: PopupAlertComponentComponent,
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
    const { data } = await deletePopover.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'remove') {
        from(this.loaderService.showLoader())
          .pipe(
            switchMap(() => {
              if (this.attachments[activeIndex].id) {
                return this.fileService.delete(this.attachments[activeIndex].id);
              } else {
                return of(null);
              }
            }),
            finalize(() => from(this.loaderService.hideLoader()))
          )
          .subscribe(() => {
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
}
