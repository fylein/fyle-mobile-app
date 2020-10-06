import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-advance-requests',
  templateUrl: './advance-requests.component.html',
  styleUrls: ['./advance-requests.component.scss'],
})
export class AdvanceRequestsComponent implements OnInit {

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
