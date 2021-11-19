import { Component, OnInit, Input, ViewChild, Output, EventEmitter, DoCheck } from '@angular/core';
import { timer } from 'rxjs';
import { FileObject } from 'src/app/core/models/file_obj.model';

@Component({
  selector: 'app-receipt-preview-thumbnail',
  templateUrl: './receipt-preview-thumbnail.component.html',
  styleUrls: ['./receipt-preview-thumbnail.component.scss'],
})
export class ReceiptPreviewThumbnailComponent implements OnInit, DoCheck {
  @ViewChild('slides') imageSlides;

  @Input() attachments: FileObject[];

  @Input() isUploading: boolean;

  @Input() canEdit: boolean;

  @Output() addMoreAttachments: EventEmitter<void> = new EventEmitter();

  @Output() viewAttachments: EventEmitter<void> = new EventEmitter();

  sliderOptions;

  activeIndex = 0;

  previousCount: number;

  constructor() {}

  ngOnInit() {
    this.sliderOptions = {
      slidesPerView: 1,
      spaceBetween: 80,
    };
    this.previousCount = this.attachments.length;
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }

  addAttachments(event) {
    this.addMoreAttachments.emit(event);
  }

  previewAttachments() {
    this.viewAttachments.emit();
  }

  getActiveIndex() {
    this.imageSlides.getActiveIndex().then((index) => (this.activeIndex = index));
  }

  ngDoCheck() {
    if (this.attachments.length !== this.previousCount) {
      this.previousCount = this.attachments.length;
      timer(100).subscribe(() => this.imageSlides.slideTo(this.attachments.length));
      this.getActiveIndex();
    }
  }
}
