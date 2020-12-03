import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { noop, from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { FileService } from 'src/app/core/services/file.service';

@Component({
  selector: 'app-view-attachments',
  templateUrl: './view-attachments.component.html',
  styleUrls: ['./view-attachments.component.scss'],
})
export class ViewAttachmentsComponent implements OnInit {

  sliderOptions: any;
  @Input() attachments: any[];
  activeIndex = 0;

  @ViewChild('slides') imageSlides: any;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
  }

  onDoneClick() {
    this.modalController.dismiss({ attachments: this.attachments });
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }

  async deleteAttachment() {
    // console.log();
    const activeIndex = await this.imageSlides.getActiveIndex();
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this Expense?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: noop
        }, {
          text: 'Okay',
          handler: () => {
            from(this.loaderService.showLoader()).pipe(
              switchMap(() => {
                return this.fileService.delete(this.attachments[activeIndex].id);
              }),
              finalize(() => from(this.loaderService.hideLoader()))
            ).subscribe(() => {
              this.attachments.splice(activeIndex, 1);
              if (this.attachments.length === 0) {
                this.modalController.dismiss({ attachments: this.attachments });
              } else {
                if (activeIndex > 0) {
                  this.goToPrevSlide();
                } else {
                  this.goToNextSlide();
                }
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
