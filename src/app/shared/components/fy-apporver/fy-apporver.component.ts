import { Component, OnInit, Input } from '@angular/core';
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

  @Input() request;
  @Input() from;
  @Input() title;

  approverList$: Observable<any>;

  constructor(
    private modalController: ModalController,
    private router: Router
  ) { }

  async openApproverListDialog() {
    const approversListModal = await this.modalController.create({
      component: ApproverDialogComponent,
      componentProps: {
        request: this.request,
        from: this.from
      }
    });

    await approversListModal.present();

    const { data } = await approversListModal.onWillDismiss();
    if (data.reload) {
      if (this.from === 'TRIP_REQUEST') {
        this.router.navigate(['/', 'enterprise', 'view_team_trips', {id: this.request.trp_id}]);
        // this.router.navigateByUrl
      }
      if (this.from === 'ADVANCE_REQUEST') {
        this.router.navigate(['/', 'enterprise', 'view_team_advance', {id: this.request.areq_id}]);
      }
    }

  }

  ngOnInit() { }
}
