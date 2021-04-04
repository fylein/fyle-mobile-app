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

  @Input() approverEmailsList;
  @Input() id: string;
  @Input() ownerEmail: string;
  @Input() from;

  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  approverList$: Observable<any>;

  constructor(
    private modalController: ModalController
  ) { }

  async openApproverListDialog() {
    const approversListModal = await this.modalController.create({
      component: ApproverDialogComponent,
      componentProps: {
        approverEmailsList: this.approverEmailsList,
        id: this.id,
        from: this.from,
        ownerEmail: this.ownerEmail
      }
    });

    await approversListModal.present();

    const { data } = await approversListModal.onWillDismiss();
    if (data && data.reload) {
      this.notify.emit(true);
    }

  }

  ngOnInit() { }
}
