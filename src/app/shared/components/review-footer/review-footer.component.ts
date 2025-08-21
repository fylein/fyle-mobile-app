import { Component, Input, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-review-footer',
  templateUrl: './review-footer.component.html',
  styleUrls: ['./review-footer.component.scss'],
  standalone: false,
})
export class ReviewFooterComponent implements OnInit {
  private trackingService = inject(TrackingService);

  @Input() activeIndex: number;

  @Input() reviewList: Array<Expense>;

  @Input() saveAndPrevLoader: boolean;

  @Input() saveAndNextLoader: boolean;

  @Output() saveAndGoToPrev = new EventEmitter();

  @Output() saveAndGoToNext = new EventEmitter();

  ngOnInit() {}

  onSaveAndGoToNext() {
    this.trackingService.footerSaveAndNextClicked();
    this.saveAndGoToNext.emit();
  }

  onSaveAndGoToPrev() {
    this.trackingService.footerSaveAndPrevClicked();
    this.saveAndGoToPrev.emit();
  }
}
