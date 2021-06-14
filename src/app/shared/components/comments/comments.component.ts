import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';
import { ViewCommentComponent } from './view-comment/view-comment.component';
import {TrackingService} from '../../../core/services/tracking.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {

  @Input() objectType: string;
  @Input() objectId: string;
  @Input() mode: string;
  @Input() hideIcon: boolean;
  @Input() text: string;
  @Input() showCommentsCount?: boolean;
  @Input() dontLoadComments?: boolean;

  noOfComments$: Observable<number>;
  refreshComments$ = new Subject();

  constructor(
    private modalController: ModalController,
    private statusService: StatusService,
    private trackingService: TrackingService,
    private modalProperties: ModalPropertiesService
  ) { }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: this.objectType,
        objectId: this.objectId,
        mode: this.mode
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment({Asset: 'Mobile'});
      this.refreshComments$.next();
    } else {
      this.trackingService.viewComment({Asset: 'Mobile'});
    }
  }

  ngOnInit() {
    this.noOfComments$ = this.refreshComments$.pipe(
      startWith(0),
      switchMap(() => {
        return this.statusService.find(this.objectType, this.objectId).pipe(
          map(res => {
            return res.filter((estatus) => {
              return estatus.st_org_user_id !== 'SYSTEM';
            }).length;
          }),
        );
      })
    );
    this.refreshComments$.next();
  }

}
