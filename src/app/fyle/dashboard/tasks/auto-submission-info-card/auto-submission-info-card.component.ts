import { Component, Input, output, input, computed, inject, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { MatIcon } from '@angular/material/icon';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-auto-submission-info-card',
  templateUrl: './auto-submission-info-card.component.html',
  styleUrls: ['./auto-submission-info-card.component.scss'],
  imports: [AsyncPipe, CurrencyPipe, DatePipe, MatIcon, TranslocoPipe],
})
export class AutoSubmissionInfoCardComponent {
  private currencyService = inject(CurrencyService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private readonly expenseFieldNameMap = signal<Record<string, string>>({});

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoSubmissionReportDate: Date;

  readonly orgSettings = input<OrgSettings>();

  readonly cardClicked = output<void>();

  readonly homeCurrency$ = this.currencyService.getHomeCurrency();

  readonly groupingDimensions = computed(
    () => this.orgSettings()?.auto_report_submission_settings?.expense_grouping_dimensions || [],
  );

  readonly showAutoApprovalInfo = computed(() => {
    const orgSettings = this.orgSettings();
    return (
      !!orgSettings?.auto_report_approval_settings?.allowed && !!orgSettings?.auto_report_approval_settings?.enabled
    );
  });

  readonly autoApprovalThreshold = computed(() => this.orgSettings()?.auto_report_approval_settings?.amount_threshold);

  readonly groupingDimensionLabel = computed(() => {
    const groupingDimensions = this.groupingDimensions();
    if (!groupingDimensions.length) {
      return '';
    }

    return groupingDimensions
      .map((dimension) => this.getGroupingDimensionLabel(dimension))
      .filter(Boolean)
      .join(', ');
  });

  showAutoSubmissionInfo(): boolean {
    return !!this.autoSubmissionReportDate;
  }

  showGroupingInfo(): boolean {
    return this.groupingDimensions().length > 0;
  }

  showDetailedInfoCard(): boolean {
    const enabledCount =
      Number(this.showGroupingInfo()) + Number(this.showAutoSubmissionInfo()) + Number(this.showAutoApprovalInfo());

    return enabledCount >= 2;
  }

  constructor() {
    this.expenseFieldsService
      .getAllMap()
      .pipe(take(1))
      .subscribe((expenseFieldsMap) => {
        this.expenseFieldNameMap.set({
          project_id: expenseFieldsMap?.project_id?.[0]?.field_name,
          cost_center_id: expenseFieldsMap?.cost_center_id?.[0]?.field_name,
        });
      });
  }

  private getGroupingDimensionLabel(dimension: string): string {
    const normalizedDimension = dimension?.toLowerCase();
    if (normalizedDimension === 'project' || normalizedDimension === 'project_id') {
      return this.expenseFieldNameMap().project_id || 'Project';
    }

    if (normalizedDimension === 'cost_center' || normalizedDimension === 'cost_center_id') {
      return this.expenseFieldNameMap().cost_center_id || 'Cost center';
    }

    return dimension.replace(/_/g, ' ').toLowerCase();
  }

  onCardClicked() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.cardClicked.emit();
  }
}
