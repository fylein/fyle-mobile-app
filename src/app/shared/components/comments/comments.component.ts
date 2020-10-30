import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
  @Input() hideIcon?: Boolean;
  @Input() text: string;
  @Input() showCommentsCount?: Boolean; 
  @Input() dontLoadComments?: Boolean;

  noOfComments: number;

  constructor(
    private modalController: ModalController
  ) { }

  async presentModal() {
      const modal = await this.modalController.create({
        component: ViewCommentComponent,
        componentProps: {
          'objectType': this.objectType,
          'objectId': this.objectId,
          'mode': this.mode
        }
      });
      return await modal.present();
  }

  ngOnInit() {
    // Todo: showCommentsCount and dontLoadComments, need to figure out one tech debt for not loading comments in modal when this the showCommentsCount is true;
  }

}
