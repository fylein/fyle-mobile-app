import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDateRangePicker } from '@angular/material/datepicker';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-date-range-modal',
  templateUrl: './date-range-modal.component.html',
  styleUrls: ['./date-range-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, MatDateRangeInput, MatStartDate, MatEndDate, MatDateRangePicker, TranslocoPipe],
})
export class DateRangeModalComponent implements OnInit {
  @ViewChild('dateRangeStart') dateRangeStart: ElementRef;

  @ViewChild('dateRangeEnd') dateRangeEnd: ElementRef;

  isCalenderVisible = false;

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {}

  selectRange(range: string) {
    this.modalController.dismiss({
      range,
    });
  }

  datePicked() {
    this.modalController.dismiss({
      range: 'Custom Range',
      startDate: this.dateRangeStart.nativeElement.value,
      endDate: this.dateRangeEnd.nativeElement.value,
    });
  }

  calenderOpened() {
    this.isCalenderVisible = true;
  }

  calenderClosed() {
    this.isCalenderVisible = false;
  }
}
