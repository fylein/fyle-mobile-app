import { Component, OnInit, Input } from '@angular/core';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { TranslocoService } from '@jsverse/transloco';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Component({
  selector: 'app-audit-history',
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss'],
  standalone: false,
})
export class AuditHistoryComponent implements OnInit {
  @Input() estatuses: ExtendedStatus[];

  projectFieldName: string;

  constructor(
    private expenseFieldsService: ExpenseFieldsService,
    private translocoService: TranslocoService,
  ) {}

  // TODO - replace forEach with find
  getAndUpdateProjectName(): void {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expenseFields.forEach((expenseField) => {
        if (expenseField.column_name === 'project_id') {
          this.projectFieldName = expenseField.field_name;
        }
      });

      this.updateProjectNameKey();
    });
  }

  updateProjectNameKey(): void {
    this.estatuses = this.estatuses.map((estatus: ExtendedStatus) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (estatus && estatus.st_diff && estatus.st_diff['project name']) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const project = estatus.st_diff['project name'];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete estatus.st_diff['project name'];

        // Failsafe - if a property similar to projectFieldName already exists
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (estatus.st_diff.hasOwnProperty(this.projectFieldName)) {
          this.projectFieldName = this.translocoService.translate('auditHistory.projectNameCollision', {
            projectFieldName: this.projectFieldName,
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        estatus.st_diff = { ...estatus.st_diff, [this.projectFieldName]: project };
      }
      return estatus;
    });
  }

  hasDetails(): void {
    this.estatuses = this.estatuses.map(function (estatus) {
      if (estatus) {
        estatus.has_details =
          estatus.st_diff &&
          typeof estatus.st_diff === 'object' &&
          Object.keys(estatus.st_diff as Record<string, unknown>).length > 0;
      }
      return estatus;
    });
  }

  setReimbursable(): void {
    this.estatuses = this.estatuses.map((status) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (status && status.st_diff && status.st_diff.hasOwnProperty('non-reimbursable')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status.st_diff.reimbursable = status.st_diff['non-reimbursable']
          ? this.translocoService.translate('auditHistory.reimbursableNo')
          : this.translocoService.translate('auditHistory.reimbursableYes');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete status.st_diff['non-reimbursable'];
      }
      return status;
    });
  }

  ngOnInit(): void {
    this.projectFieldName = this.translocoService.translate('auditHistory.defaultProjectFieldName');
    this.hasDetails();
    this.setReimbursable();
    this.getAndUpdateProjectName();
  }
}
