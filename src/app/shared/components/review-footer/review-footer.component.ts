import { Component, Input, OnInit, inject, output } from '@angular/core';
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

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() activeIndex: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reviewList: Array<Expense>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() saveAndPrevLoader: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() saveAndNextLoader: boolean;

  readonly saveAndGoToPrev = output();

  readonly saveAndGoToNext = output();

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
