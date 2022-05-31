import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-hotel-request',
  templateUrl: './hotel-request.component.html',
  styleUrls: ['./hotel-request.component.scss'],
})
export class HotelRequestComponent implements OnInit {
  @Input() hotelRequests: any[];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}
}
