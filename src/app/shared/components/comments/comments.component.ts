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
  @Input() objectId: any;

  constructor(
    private modalController: ModalController
  ) { }

  async presentModal() {
      const modal = await this.modalController.create({
        component: ViewCommentComponent,
        componentProps: {
          'objectType': this.objectType,
          'objectId': this.objectId,
        }
      });
      return await modal.present();
  }

  ngOnInit() {
  }

}
