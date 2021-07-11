import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-fy-receipt-preview-thumbnail',
  templateUrl: './fy-receipt-preview-thumbnail.component.html',
  styleUrls: ['./fy-receipt-preview-thumbnail.component.scss'],

})
export class FyReceiptPreviewThumbnailComponent implements OnInit {

  @Input() attachments: any = [];
  @Input()  isUploading: boolean;

  @Output() addMoreAttachments: EventEmitter<void> = new EventEmitter();
  @Output() viewAttachments: EventEmitter<void> = new EventEmitter();

  sliderOptions: any;
  activeIndex: number = 0;
  previousCount: number;


  @ViewChild('slides') imageSlides: any;

  constructor() { }

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

  addAttachments($event) {
    this.addMoreAttachments.emit($event);
  }

  previewAttachments() {
    this.viewAttachments.emit();
  }

  getActiveIndex() {
    this.imageSlides.getActiveIndex().then(index => this.activeIndex = index);
  }

  ngDoCheck() {
    if (this.attachments.length !== this.previousCount) {
      this.previousCount = this.attachments.length;
      timer(100).subscribe(() => this.imageSlides.slideTo(this.attachments.length));
      this.getActiveIndex();
    }
  }

}
