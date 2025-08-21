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

  @Input() message: string;

  @Input() type: 'information' | 'warning' | 'error' | 'danger';

  @Input() showActionButton = false;

  @Input() actionButtonContent: string;

  @Output() actionClick = new EventEmitter<void>();

  ngOnInit(): void {
    this.actionButtonContent = this.actionButtonContent || this.translocoService.translate('fyAlertInfo.action');
  }

  onActionClick(): void {
    this.actionClick.emit();
  }
}
