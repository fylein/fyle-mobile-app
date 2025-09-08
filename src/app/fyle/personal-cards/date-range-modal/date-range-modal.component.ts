import { Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-range-modal',
  templateUrl: './date-range-modal.component.html',
  styleUrls: ['./date-range-modal.component.scss'],
  standalone: false,
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
