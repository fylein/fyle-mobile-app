import { Component, OnInit, Input, ViewChild, Output, EventEmitter, DoCheck } from '@angular/core';
import { timer } from 'rxjs';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { Swiper } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
@Component({
  selector: 'app-receipt-preview-thumbnail',
  templateUrl: './receipt-preview-thumbnail.component.html',
  styleUrls: ['./receipt-preview-thumbnail.component.scss'],
})
export class ReceiptPreviewThumbnailComponent implements OnInit, DoCheck {
  @ViewChild('slides', { static: false }) imageSlides?: SwiperComponent;

  @Input() attachments: FileObject[];

  @Input() isUploading: boolean;

  @Input() canEdit: boolean;

  @Input() mode: boolean;

  @Input() hideLabel: boolean;

  @Input() isMileageExpense: boolean;

  @Output() addMoreAttachments: EventEmitter<void> = new EventEmitter();

  @Output() viewAttachments: EventEmitter<void> = new EventEmitter();

  sliderOptions;

  activeIndex = 0;

  previousCount: number;

  numLoadedImage = 0;

  constructor(private trackingService: TrackingService) {}

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
    this.trackingService.eventTrack('Add More Files Clicked', { mode: this.mode });
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
  }
}
