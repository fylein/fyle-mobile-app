import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PopupService } from 'src/app/core/services/popup.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FileService } from 'src/app/core/services/file.service';
import { from, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-fy-view-attachment',
  templateUrl: './fy-view-attachment.component.html',
  styleUrls: ['./fy-view-attachment.component.scss'],
})
export class FyViewAttachmentComponent implements OnInit {

  sliderOptions: any;
  @Input() attachments: any[];
  @Input() canEdit = false;
  activeIndex = 0;

  @ViewChild('slides') imageSlides: any;
  zoomScale: number;

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private popupService: PopupService,
    private loaderService: LoaderService,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.zoomScale = 0.5;
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };

    this.attachments.forEach(attachment => {
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

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }

  async deleteAttachment() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    const popupResult = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this attachment?',
      primaryCta: {
        text: 'DELETE'
      }
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          if (this.attachments[activeIndex].id) {
            return this.fileService.delete(this.attachments[activeIndex].id);
          } else {
            return of(null);
          }
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
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
