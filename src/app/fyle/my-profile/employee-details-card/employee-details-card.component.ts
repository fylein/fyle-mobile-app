import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

@Component({
  selector: 'app-employee-details-card',
  templateUrl: './employee-details-card.component.html',
  styleUrls: ['./employee-details-card.component.scss'],
})
export class EmployeeDetailsCardComponent {
  @Input() eou: ExtendedOrgUser;

  @Output() updateMobileNumber = new EventEmitter();

  constructor() {}

  onUpdateMobileNumber(eou: ExtendedOrgUser) {
    this.updateMobileNumber.emit(eou);
  }
}
