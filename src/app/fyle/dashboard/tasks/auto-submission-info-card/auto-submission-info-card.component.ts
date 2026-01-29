import { Component, Input, output, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrgSettings } from 'src/app/core/models/org-settings.model';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
  imports: [DatePipe, TranslocoPipe],
})
export class AutoSubmissionInfoCardComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoSubmissionReportDate: Date;

  readonly orgSettings = input<OrgSettings>();

  readonly cardClicked = output<void>();

  readonly showAutoApprovalInfo = computed(() => {
    const orgSettings = this.orgSettings();
    return (
      !!orgSettings?.auto_report_approval_settings?.allowed && !!orgSettings?.auto_report_approval_settings?.enabled
    );
  });

  onCardClicked() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cardClicked.emit();
  }
}
