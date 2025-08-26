import { Component, OnInit, Input, ViewChild, DoCheck, inject, input, output } from '@angular/core';
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

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() attachments: FileObject[];

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() isUploading: boolean;

  readonly canEdit = input<boolean>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() mode: string;

  readonly hideLabel = input<boolean>(undefined);

  readonly isMileageExpense = input<boolean>(undefined);

  readonly addMoreAttachments = output<void>();

  readonly viewAttachments = output<void>();

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
