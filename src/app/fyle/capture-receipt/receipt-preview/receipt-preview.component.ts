import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {

  @Input() base64Images: string[];
  sliderOptions: { zoom: { maxRatio: number; }; };
  @ViewChild('slides') imageSlides: any;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log(this.base64Images);
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
  }

  close() {
    //Todo: implement alert
    this.retake();
  }

  retake() {
    this.base64Images = [];
    this.modalController.dismiss({
      base64Images: this.base64Images
    })
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }

}
