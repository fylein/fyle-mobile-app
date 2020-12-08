import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalController } from '@ionic/angular';
import { ApproverDialogComponent } from './approver-dialog/approver-dialog.component';


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
    private loaderService: LoaderService,
    private modalController: ModalController
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
  }

  ngOnInit() {

  }
}
