import { Component, OnInit, Input } from '@angular/core';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';

@Component({
  selector: 'app-audit-history',
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss'],
})
export class AuditHistoryComponent implements OnInit {
  @Input() estatuses;

  projectFieldName = 'project';

  constructor(private expenseFieldsService: ExpenseFieldsService) {}

  // TODO - replace forEach with find
  getAndUpdateProjectName() {
    this.expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expenseFields.forEach((expenseField) => {
        if (expenseField.column_name === 'project_id') {
          this.projectFieldName = expenseField.field_name;
        }
      });

      this.updateProjectNameKey();
    });
  }

  updateProjectNameKey() {
    this.estatuses = this.estatuses.map((estatus) => {
      if (estatus && estatus.st_diff && estatus.st_diff['project name']) {
        const project = estatus.st_diff['project name'];
        delete estatus.st_diff['project name'];

        // Failsafe - if a property similar to projectFieldName already exists
        if (estatus.st_diff.hasOwnProperty(this.projectFieldName)) {
          this.projectFieldName = `project name (${this.projectFieldName})`;
        }

        estatus.st_diff = { ...estatus.st_diff, [this.projectFieldName]: project };
      }
      return estatus;
    });
  }

  hasDetails() {
    this.estatuses = this.estatuses.map(function (estatus) {
      if (estatus) {
        estatus.has_details = estatus.st_diff !== null && Object.keys(estatus.st_diff).length > 0;
      }
      return estatus;
    });
  }

  setReimbursable() {
    this.estatuses = this.estatuses.map(function (status) {
      if (status && status.st_diff && status.st_diff.hasOwnProperty('non-reimbursable')) {
        status.st_diff.reimbursable = status.st_diff['non-reimbursable'] ? 'No' : 'Yes';
        delete status.st_diff['non-reimbursable'];
      }
      return status;
    });
  }

  ngOnInit() {
    this.hasDetails();
    this.setReimbursable();
    this.getAndUpdateProjectName();
  }
}
