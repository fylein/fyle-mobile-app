import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-transportation-request',
  templateUrl: './transportation-request.component.html',
  styleUrls: ['./transportation-request.component.scss'],
})
export class TransportationRequestComponent implements OnInit {
  @Input() transportationRequests: any[];

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}
}
