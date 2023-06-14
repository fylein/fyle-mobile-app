import { Component, OnInit, Input, ViewChild, Output, EventEmitter, DoCheck } from '@angular/core';
import { timer } from 'rxjs';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { Swiper } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
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

  @Input() hideLabel: boolean;

  @Input() isMileageExpense: boolean;

  @Output() addMoreAttachments: EventEmitter<void> = new EventEmitter();

  @Output() viewAttachments: EventEmitter<void> = new EventEmitter();

  sliderOptions;

  activeIndex = 0;

  previousCount: number;

  numLoadedImage = 0;

  constructor() {}

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
