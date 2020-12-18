import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';
import { ViewCommentComponent } from './view-comment/view-comment.component';

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

  constructor(
    private modalController: ModalController,
    private statusService: StatusService
  ) { }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ViewCommentComponent,
      componentProps: {
        objectType: this.objectType,
        objectId: this.objectId,
        mode: this.mode
      }
    });
    return await modal.present();
  }

  ngOnInit() {
    this.noOfComments$ = this.statusService.find(this.objectType, this.objectId).pipe(
      map(res => {
        return res.filter((estatus) => {
          return estatus.st_org_user_id !== 'SYSTEM';
        }).length;
      }),
    );
  }

}
