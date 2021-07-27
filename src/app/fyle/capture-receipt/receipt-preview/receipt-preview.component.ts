import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActionSheetController, ModalController, PopoverController } from '@ionic/angular';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { AddMorePopupComponent } from '../add-more-popup/add-more-popup.component';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {

  @ViewChild('slides') imageSlides: any;

  @Input() base64ImagesWithSource: string[];

  @Input() mode: string;

  sliderOptions: { zoom: { maxRatio: number } };

  activeIndex: number;

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private matBottomSheet: MatBottomSheet,
  ) { }

  ngOnInit() {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    this.activeIndex = 0;
  }

  async finish() {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource
    });
  }

  async close() {
    let message;
    if (this.base64ImagesWithSource.length > 1) {
      message = `Are you sure you want to discard the ${this.base64ImagesWithSource.length} receipts you just captured?`;
    } else {
      message = 'Not a good picture? No worries. Discard and click again.';
    }
    const closePopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title: 'Discard Receipt',
        message,
        primaryCta: {
          text: 'Discard',
          action: 'discard',
          type: 'alert'
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel'
        }
      },
      cssClass: 'pop-up-in-center'
    });

    await closePopOver.present();

    const { data } = await closePopOver.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'discard') {
        this.retake();
      }
    }
  }

  async addMore () {

    const addMoreDialog = this.matBottomSheet.open(AddMorePopupComponent, {
      data: {  },
      panelClass: ['mat-bottom-sheet-2']
    });

    const data = await addMoreDialog.afterDismissed().toPromise();
    if (data) {
      if (data.mode === 'camera') {
        this.captureReceipts();
      } else {
        this.galleryUplaod();
      }
    }
      
      
      


    // const actionSheetButtons = [
    //   {
    //     text: 'Capture Receipts',
    //     icon: 'assets/svg/fy-camera.svg',
    //     cssClass: 'receipt-preview--capture-receipt',
    //     handler: () => {
    //       console.log("-------1--------");
    //       this.captureReceipts();
    //     }
    //   },
    //   {
    //     text: 'Upload from Gallery',
    //     icon: 'assets/svg/gallery.svg', // Todo: Fix gallery icon
    //     cssClass: 'receipt-preview--gallery-upload',
    //     handler: () => {
    //       console.log("-------2--------")
    //     }
    //   }
    // ];
    // const actionSheet = await this.actionSheetController.create({
    //   header: 'ADD MORE USING',
    //   mode: 'md',
    //   cssClass: ['fy-action-sheet', 'receipt-preview--action-sheet'],
    //   buttons: actionSheetButtons
    // });
    // await actionSheet.present();
  }


  galleryUplaod() {
    //Todo
  }


  captureReceipts () {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
      continueCaptureReceipt: true
    });
  }

  async delete() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    const deletePopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title: 'Remove Receipt',
        message: 'Are you sure you want to remove this receipt?',
        primaryCta: {
          text: 'Remove',
          action: 'remove',
          type: 'alert'
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel'
        }
      },
      cssClass: 'pop-up-in-center'
    });

    await deletePopOver.present();

    const { data } = await deletePopOver.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'remove') {
        this.base64ImagesWithSource.splice(activeIndex, 1);
        if (this.base64ImagesWithSource.length === 0) {
          this.retake();
        } else {
          await this.imageSlides.update();
          this.activeIndex = await this.imageSlides.getActiveIndex();
        }
      }
    }
  }

  retake() {
    this.base64ImagesWithSource.pop();
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource
    });
  }

  async goToNextSlide() {
    await this.imageSlides.slideNext();
    await this.imageSlides.update();
  }

  async goToPrevSlide() {
    await this.imageSlides.slidePrev();
    await this.imageSlides.update();
  }

  async ionSlideDidChange() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    this.activeIndex = activeIndex;
  }

}
