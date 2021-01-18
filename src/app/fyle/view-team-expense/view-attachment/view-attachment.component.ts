import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-view-attachment',
  templateUrl: './view-attachment.component.html',
  styleUrls: ['./view-attachment.component.scss'],
})
export class ViewAttachmentComponent implements OnInit {
  sliderOptions: any;
  @Input() attachments: any[];
  activeIndex = 0;

  @ViewChild('slides') imageSlides: any;

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
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

  onDoneClick() {
    this.modalController.dismiss({ attachments: this.attachments });
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }
}
