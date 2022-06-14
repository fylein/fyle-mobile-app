import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';
import { ViewCommentComponent } from './view-comment/view-comment.component';
import { TrackingService } from '../../../core/services/tracking.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-comments-history',
  templateUrl: './comments-history.component.html',
  styleUrls: ['./comments-history.component.scss'],
})
export class CommentsHistoryComponent implements OnInit {
  @Input() objectType: string;

  @Input() objectId: string;

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
  ) {}

  async presentModal() {
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: this.objectType,
        objectId: this.objectId,
      },
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data && data.updated) {
      this.trackingService.addComment();
      this.refreshComments$.next();
    } else {
      this.trackingService.viewComment();
    }
  }

  ngOnInit() {
    this.noOfComments$ = this.refreshComments$.pipe(
      startWith(0),
      switchMap(() =>
        this.statusService
          .find(this.objectType, this.objectId)
          .pipe(map((res) => res.filter((estatus) => estatus.us_full_name).length))
      )
    );
    this.refreshComments$.next();
  }
}
