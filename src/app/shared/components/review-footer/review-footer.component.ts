import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-review-footer',
  templateUrl: './review-footer.component.html',
  styleUrls: ['./review-footer.component.scss'],
})
export class ReviewFooterComponent implements OnInit {

  @Input() activeIndex: number;
  @Input() reviewList: Array<Expense>;
  @Input() saveAndPrevLoader: boolean;
  @Input() saveAndNextLoader: boolean;

  @Output() goToPrev = new EventEmitter();
  @Output() goToNext = new EventEmitter();
  @Output() saveAndGoToPrev = new EventEmitter();
  @Output() saveAndGoToNext = new EventEmitter();
  
  constructor() { }

  ngOnInit() {}

  onGoToPrev() {
    this.goToPrev.emit();
  }

  onGoToNext() {
    this.goToNext.emit();
  }

  onSaveAndGoToNext() {
    this.saveAndGoToNext.emit();
  }

  onSaveAndGoToPrev() {
    this.saveAndGoToPrev.emit();
  }
}
