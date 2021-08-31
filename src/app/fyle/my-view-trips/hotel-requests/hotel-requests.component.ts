import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-hotel-requests',
  templateUrl: './hotel-requests.component.html',
  styleUrls: ['./hotel-requests.component.scss'],
})
export class HotelRequestsComponent implements OnInit {
  @Input() hotelRequests: any[];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}
}
