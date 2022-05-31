import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-transportation-requests',
  templateUrl: './transportation-requests.component.html',
  styleUrls: ['./transportation-requests.component.scss'],
})
export class TransportationRequestsComponent implements OnInit {
  @Input() transportationRequests: any[];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}
}
