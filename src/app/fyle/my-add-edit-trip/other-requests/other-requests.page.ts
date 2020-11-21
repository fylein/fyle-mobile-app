import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-other-requests',
  templateUrl: './other-requests.page.html',
  styleUrls: ['./other-requests.page.scss'],
})
export class OtherRequestsPage implements OnInit {

  isTransportationRequested;
  isHotelRequested;
  isAdvanceRequested;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  goBack() {
    this.modalController.dismiss();
  }

  ngOnInit() {
    // this.isTransportationRequested = this.navParams.get('otherRequests.transportation');
    // this.isHotelRequested = this.navParams.get('otherRequests.hotel');
    // this.isAdvanceRequested = this.navParams.get('otherRequests.advance');

    console.log(this.navParams.get('otherRequests'));
  }

}
