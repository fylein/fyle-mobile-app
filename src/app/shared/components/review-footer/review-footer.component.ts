import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { IonicModule } from '@ionic/angular';
import { FormButtonValidationDirective } from '../../directive/form-button-validation.directive';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-review-footer',
    templateUrl: './review-footer.component.html',
    styleUrls: ['./review-footer.component.scss'],
    imports: [
        IonicModule,
        FormButtonValidationDirective,
        TranslocoPipe,
    ],
})
export class ReviewFooterComponent implements OnInit {
  @Input() activeIndex: number;

  @Input() reviewList: Array<Expense>;

  @Input() saveAndPrevLoader: boolean;

  @Input() saveAndNextLoader: boolean;

  @Output() saveAndGoToPrev = new EventEmitter();

  @Output() saveAndGoToNext = new EventEmitter();

  constructor(private trackingService: TrackingService) {}

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
