import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fy-nav-footer',
  templateUrl: './fy-nav-footer.component.html',
  styleUrls: ['./fy-nav-footer.component.scss'],
})
export class FyNavFooterComponent {
  @Input() activeExpenseIndex: number;

  @Input() numExpensesInReport: number;

  @Output() nextClicked = new EventEmitter<void>();

  @Output() prevClicked = new EventEmitter<void>();

  goToNext(): void {
    this.nextClicked.emit();
  }

  goToPrev(): void {
    this.prevClicked.emit();
  }
}
