import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-advance-request',
  templateUrl: './advance-request.component.html',
  styleUrls: ['./advance-request.component.scss'],
})
export class AdvanceRequestComponent implements OnInit {

  @Input() advanceRequests: any[];

  constructor(
    private modalController: ModalController
  ) { }

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {
    console.log(this.advanceRequests);
  }

}
