import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ApproverDialogComponent } from './approver-dialog/approver-dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-fy-apporver',
  templateUrl: './fy-apporver.component.html',
  styleUrls: ['./fy-apporver.component.scss'],
})
export class FyApporverComponent implements OnInit {

  @Input() approverList;
  @Input() id;
  @Input() from;
  @Input() title;

  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  approverList$: Observable<any>;

  constructor(
    private modalController: ModalController
  ) { }

  async openApproverListDialog() {
    const approversListModal = await this.modalController.create({
      component: ApproverDialogComponent,
      componentProps: {
        approverList: this.approverList,
        id: this.id,
        from: this.from
      }
    });

    await approversListModal.present();

    // TODO: Cleanup @madhav (this is used in tripa and advance only, please verify and remove if conditions)
    const { data } = await approversListModal.onWillDismiss();
    if (data && data.reload) {
      if (this.from === 'TRIP_REQUEST') {
        this.notify.emit(true);
      }
      if (this.from === 'ADVANCE_REQUEST') {
        this.notify.emit(true);
      }
    }

  }

  ngOnInit() { }
}
