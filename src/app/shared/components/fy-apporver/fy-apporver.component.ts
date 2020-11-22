import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApproverModalPageModule } from './approver-modal/approver-modal.module';

@Component({
  selector: 'app-fy-apporver',
  templateUrl: './fy-apporver.component.html',
  styleUrls: ['./fy-apporver.component.scss'],
})
export class FyApporverComponent implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  async openApproverModal() {
    const modal = await this.modalController.create({
    component: ApproverModalPageModule,
    componentProps: { value: 123 }
    });

    await modal.present();

  }

  ngOnInit() {}

}
