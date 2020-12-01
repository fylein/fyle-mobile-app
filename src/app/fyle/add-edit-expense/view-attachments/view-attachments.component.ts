import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view-attachments',
  templateUrl: './view-attachments.component.html',
  styleUrls: ['./view-attachments.component.scss'],
})
export class ViewAttachmentsComponent implements OnInit {

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
    this.modalController.dismiss();
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }
}
