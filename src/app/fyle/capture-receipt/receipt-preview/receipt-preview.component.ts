import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {

  @Input() base64Images: string[];
  sliderOptions: { zoom: { maxRatio: number; }; };

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

}
