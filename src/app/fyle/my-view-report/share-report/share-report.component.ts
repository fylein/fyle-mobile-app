import { AfterViewInit, Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-share-report',
  templateUrl: './share-report.component.html',
  styleUrls: ['./share-report.component.scss'],
  standalone: false,
})
export class ShareReportComponent implements OnInit, AfterViewInit {
  private modalController = inject(ModalController);

  readonly simpleEmailInput = viewChild<ElementRef>('simpleEmailInput');

  email = '';

  async cancel() {
    await this.modalController.dismiss();
  }

  shareReport(emailInput) {
    if (!(emailInput.value.trim().length > 0) || emailInput.invalid) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      emailInput.control?.setErrors({ invalidAfterSubmit: true });
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
    const emailInputField = this.simpleEmailInput().nativeElement as HTMLInputElement;
    setTimeout(() => {
      emailInputField.focus();
    }, 600);
  }
}
