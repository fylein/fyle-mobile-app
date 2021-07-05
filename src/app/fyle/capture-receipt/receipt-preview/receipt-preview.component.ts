import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {

  @Input() base64Images: string[];
  sliderOptions: any;
  @ViewChild('slides') imageSlides: any;
  activeIndex: any;

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
    this.activeIndex = 0;
  }

  close() {
    //Todo: implement alert
    this.retake();
  }

  async delete() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    console.log(activeIndex);
    this.base64Images.splice(activeIndex, 1);
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

  async ionSlideDidChange() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    this.activeIndex = activeIndex;
    console.log(activeIndex);
  }

}
