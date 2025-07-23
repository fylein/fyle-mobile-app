import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-fy-nav-footer',
    templateUrl: './fy-nav-footer.component.html',
    styleUrls: ['./fy-nav-footer.component.scss'],
    imports: [IonicModule, TranslocoPipe],
})
export class FyNavFooterComponent {
  @Input() activeExpenseIndex: number;

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
