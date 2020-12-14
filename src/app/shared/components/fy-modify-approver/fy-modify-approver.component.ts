import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ModifyApproverDialogComponent } from './modify-approver-dialog/modify-approver-dialog.component';

@Component({
  selector: 'app-fy-modify-approver',
  templateUrl: './fy-modify-approver.component.html',
  styleUrls: ['./fy-modify-approver.component.scss'],
})
export class FyModifyApproverComponent implements OnInit {

  @Input() approverList;
  @Input() id;
  @Input() from;
  @Input() title;
  @Input() object;

  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  approverList$: Observable<any>;

  constructor(
    private modalController: ModalController
  ) { }

  async openApproverListDialog() {
    const approversListModal = await this.modalController.create({
      component: ModifyApproverDialogComponent,
      componentProps: {
        approverList: this.approverList,
        id: this.id,
        from: this.from,
        object: this.object
      }
    });

    await approversListModal.present();

    const { data } = await approversListModal.onWillDismiss();
    if (data && data.reload) {
      if (this.from === 'TEAM_REPORTS') {
        this.notify.emit(true);
      }
    }

  }

  ngOnInit() { }
}
