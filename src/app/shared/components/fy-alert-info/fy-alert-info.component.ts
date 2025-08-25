import { Component, Input, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
  standalone: false,
})
export class FyAlertInfoComponent implements OnInit {
  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() message: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() type: 'information' | 'warning' | 'error' | 'danger';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showActionButton = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() actionButtonContent: string;

  @Output() actionClick = new EventEmitter<void>();

  ngOnInit(): void {
    this.actionButtonContent = this.actionButtonContent || this.translocoService.translate('fyAlertInfo.action');
  }

  onActionClick(): void {
    this.actionClick.emit();
  }
}
