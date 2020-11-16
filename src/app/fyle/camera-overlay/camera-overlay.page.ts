import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

const { CameraPreview } = Plugins;
import '@capacitor-community/camera-preview';
import { CurrencyService } from 'src/app/core/services/currency.service';

import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionsOutboxService } from 'src/app/services/transactions-outbox.service';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
})
export class CameraOverlayPage implements OnInit {
  isCameraShown = true;
  recentImage: string;
  isBulkMode: boolean;
  isCameraOpenedInOneClick = false;
  lastImage: string;
  captureCount: number;
  homeCurrency: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private currencyService: CurrencyService,
    private transactionsOutboxService: TransactionsOutboxService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  setUpAndStartCamera() {
    this.isCameraShown = true;
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.innerHeight - 120,
      parent: 'cameraPreview'
    };

    CameraPreview.start(cameraPreviewOptions);
  }

  switchMode() {
    this.isBulkMode = !this.isBulkMode;
  }

  async uploadFiles() {
  }

  addExpenseToQueue(source, imageBase64String) {
    const transaction = {
      billable: false,
      skip_reimbursement: false,
      source,
      txn_dt: new Date(),
      amount: null,
      currency: this.homeCurrency
    };

    const attachmentUrls = [];
    const attachment = {
      thumbnail: imageBase64String,
      type: 'image',
      url: imageBase64String
    };

    attachmentUrls.push(attachment);

    this.transactionsOutboxService.addEntry(transaction, attachmentUrls);
  }

  closeImagePreview() {
    this.recentImage = '';
  }

  async syncExpenseAndFinishProcess() {
    // from(this.transactionsOutboxService.getAllQueue()).subscribe(res => {
    //   console.log(res);
    // });
    await this.finishProcess();
  }

  async finishProcess() {
    await CameraPreview.stop();
    this.router.navigate(['/', 'enterprise', 'my_dashboard']);
  }

  retake() {
    this.isCameraShown = true;
    this.recentImage = '';
    this.setUpAndStartCamera();
  }

  save() {
    this.captureCount++;
    if (this.isBulkMode) {
      // Bulk mode
      this.lastImage = this.recentImage;
      this.closeImagePreview();
      this.setUpAndStartCamera();
      this.addExpenseToQueue('BULK_INSTA', this.lastImage);

    } else {
      // Single mode
      if (this.isCameraOpenedInOneClick) {
        // todo
        //add expense to queue
      } else {
        console.log(this.recentImage);
        this.router.navigate(['/', 'enterprise', 'add_edit_expense', {dataUrl: this.recentImage}]);
        // todo redirect to add_Edit_exp page
      }
    }
  }

  async onCapture() {
    this.loaderService.showLoader('Hold Still...');
    this.isCameraShown = false;
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 100 // Reduce this to 50 later
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    await CameraPreview.stop();
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    this.recentImage = base64PictureData;
    this.loaderService.hideLoader();
  }

  ionViewWillEnter() {
    console.log('Staring camera overlay');
    console.log(window.screen.height);
    this.captureCount = 0;
    this.isBulkMode = false;
    this.setUpAndStartCamera();
    this.isCameraOpenedInOneClick = this.activatedRoute.snapshot.params.isOneClick;

    this.currencyService.getHomeCurrency().subscribe(res => {
      this.homeCurrency = res;
    });
  }

  ngOnInit() {

  }


}
