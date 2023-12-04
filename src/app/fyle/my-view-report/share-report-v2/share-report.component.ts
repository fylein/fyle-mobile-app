import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-share-report',
  templateUrl: './share-report.component.html',
  styleUrls: ['./share-report.component.scss'],
})
export class ShareReportComponentV2 implements OnInit, AfterViewInit {
  @ViewChild('simpleEmailInput') simpleEmailInput: ElementRef;

  email = '';

  constructor(private modalController: ModalController) {}

  async cancel() {
    await this.modalController.dismiss();
  }

  shareReport(emailInput) {
    if (!(emailInput.value.trim().length > 0) || emailInput.invalid) {
      return;
    }

    if (emailInput.valid) {
      this.modalController.dismiss({
        email: this.email,
      });
    } else {
      emailInput.control.markAllAsTouched();
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const emailInputField = this.simpleEmailInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      emailInputField.focus();
    }, 600);
  }
}
