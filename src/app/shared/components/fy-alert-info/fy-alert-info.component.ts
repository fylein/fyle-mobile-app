import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
})
export class FyAlertInfoComponent {
  @Input() message: string;

  @Input() type: 'information' | 'warning' | 'error' | 'danger';

  @Input() showActionButton = false;

  @Input() actionButtonContent = 'Action;';

  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }
}
