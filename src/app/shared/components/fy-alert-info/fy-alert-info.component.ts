import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
})
export class FyAlertInfoComponent {
  @Input() message: string;

  @Input() type: 'information' | 'warning' | 'error' | 'danger';

  @Input() showActionButton = false;

  @Input() actionButtonContent: string;

  @Output() actionClick = new EventEmitter<void>();

  constructor(private translocoService: TranslocoService) {
    this.actionButtonContent = this.translocoService.translate('fyAlertInfo.action');
  }

  onActionClick(): void {
    this.actionClick.emit();
  }
}
