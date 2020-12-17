import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

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
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
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
