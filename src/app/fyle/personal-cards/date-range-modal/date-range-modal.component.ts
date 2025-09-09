import { Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDateRangePicker } from '@angular/material/datepicker';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-date-range-modal',
    templateUrl: './date-range-modal.component.html',
    styleUrls: ['./date-range-modal.component.scss'],
    imports: [
        IonicModule,
        MatDateRangeInput,
        MatStartDate,
        MatEndDate,
        MatDateRangePicker,
        TranslocoPipe,
    ],
})
export class DateRangeModalComponent implements OnInit {
  private modalController = inject(ModalController);

  readonly dateRangeStart = viewChild<ElementRef<HTMLInputElement>>('dateRangeStart');

  readonly dateRangeEnd = viewChild<ElementRef<HTMLInputElement>>('dateRangeEnd');

  isCalenderVisible = false;

  ngOnInit(): void {}

  selectRange(range: string) {
    this.modalController.dismiss({
      range,
    });
  }

  datePicked() {
    this.modalController.dismiss({
      range: 'Custom Range',
      startDate: this.dateRangeStart().nativeElement.value,
      endDate: this.dateRangeEnd().nativeElement.value,
    });
  }

  calenderOpened() {
    this.isCalenderVisible = true;
  }

  calenderClosed() {
    this.isCalenderVisible = false;
  }
}
