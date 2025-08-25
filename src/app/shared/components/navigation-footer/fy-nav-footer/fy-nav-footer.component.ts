import { Component, Input, output } from '@angular/core';

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

  readonly nextClicked = output<void>();

  readonly prevClicked = output<void>();

  goToNext(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.nextClicked.emit();
  }

  goToPrev(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.prevClicked.emit();
  }
}
