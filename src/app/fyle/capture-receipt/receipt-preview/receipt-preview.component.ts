import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {

  @ViewChild('slides') imageSlides: any;

  @Input() base64ImagesWithSource: string[];

  @Input() mode: string;

  sliderOptions: { initialSlide: number; slidesPerView: number; zoom: { maxRatio: number } };

  activeIndex: number;

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private popoverController: PopoverController,
  ) {
    this.registerBackButtonAction();
  }

  registerBackButtonAction() {
    this.platform.backButton.subscribe(async () => {
      this.retake();
    });
  }

  ngOnInit() {
    this.sliderOptions = {
      initialSlide: 0,
      slidesPerView: 1,
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
    this.base64ImagesWithSource = [];
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
