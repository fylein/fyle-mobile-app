import { Component, Input, OnInit, inject, output, input } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { IonButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
  imports: [
    IonButton,
    MatIcon
  ],
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

  readonly redirectionText = input<string>(null);

  readonly allowHtml = input(false);

  readonly actionClick = output<void>();

  ngOnInit(): void {
    this.actionButtonContent = this.actionButtonContent || this.translocoService.translate('fyAlertInfo.action');
  }

  onActionClick(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.actionClick.emit();
  }
}
