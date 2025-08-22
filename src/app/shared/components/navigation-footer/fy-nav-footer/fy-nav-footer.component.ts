import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fy-nav-footer',
  templateUrl: './fy-nav-footer.component.html',
  styleUrls: ['./fy-nav-footer.component.scss'],
  standalone: false,
})
export class FyNavFooterComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() activeExpenseIndex: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() reportExpenseCount: number;

  @Output() nextClicked = new EventEmitter<void>();

  @Output() prevClicked = new EventEmitter<void>();

  goToNext(): void {
    this.nextClicked.emit();
  }

  goToPrev(): void {
    this.prevClicked.emit();
  }
}
