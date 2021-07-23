import { Component, OnInit, Input } from '@angular/core';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Component({
  selector: 'app-audit-history',
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss'],
})
export class AuditHistoryComponent implements OnInit {

  @Input() estatuses;

  constructor() { }

  hasDetails() {
    this.estatuses = this.estatuses.map(function(estatus) {
      if (estatus) {
        estatus.has_details = (estatus.st_diff !== null && Object.keys(estatus.st_diff).length > 0);
      }
      return estatus;
    });
  }

  setReimbursable() {
    this.estatuses = this.estatuses.map(function(status) {
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
  }
}
