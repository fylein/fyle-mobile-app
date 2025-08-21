import { Component, OnInit, Input, ViewChild, Output, EventEmitter, DoCheck, inject } from '@angular/core';
import { timer } from 'rxjs';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Swiper } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
@Component({
  selector: 'app-receipt-preview-thumbnail',
  templateUrl: './receipt-preview-thumbnail.component.html',
  styleUrls: ['./receipt-preview-thumbnail.component.scss'],
  standalone: false,
})
export class ReceiptPreviewThumbnailComponent implements OnInit, DoCheck {
  private trackingService = inject(TrackingService);

  @ViewChild('slides', { static: false }) imageSlides?: SwiperComponent;

  @Input() attachments: FileObject[];

  @Input() isUploading: boolean;

  @Input() canEdit: boolean;

  @Input() mode: string;

  @Input() hideLabel: boolean;

  @Input() isMileageExpense: boolean;

  @Output() addMoreAttachments: EventEmitter<void> = new EventEmitter();

  @Output() viewAttachments: EventEmitter<void> = new EventEmitter();

  sliderOptions;

  activeIndex = 0;

  previousCount: number;

  numLoadedImage = 0;

  ngOnInit() {
    this.sliderOptions = {
      slidesPerView: 1,
      spaceBetween: 80,
    };
    this.previousCount = this.attachments.length;
  }

  goToNextSlide() {
    this.imageSlides.swiperRef.slideNext(100);
  }

  goToPrevSlide() {
    this.imageSlides.swiperRef.slidePrev(100);
  }

  addAttachments(event) {
    this.addMoreAttachments.emit(event);
    this.trackingService.addMoreFilesClicked({ mode: this.mode });
  }

  previewAttachments() {
    this.viewAttachments.emit();
  }

  getActiveIndex() {
    this.activeIndex = this.imageSlides.swiperRef.activeIndex;
  }

  ngDoCheck() {
    if (this.attachments?.length !== this.previousCount) {
      this.previousCount = this.attachments.length;
      timer(100).subscribe(() => this.imageSlides.swiperRef.slideTo(this.attachments.length));
      this.getActiveIndex();
    }
  }

  onLoad() {
    this.numLoadedImage++;

    try {
      const fileId = this.attachments[this.activeIndex].id;
      this.trackingService.fileDownloadComplete({ 'File ID': fileId });
    } catch (error) {}
  }
}
