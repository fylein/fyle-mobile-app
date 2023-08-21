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

  @Output() verifyMobileNumber = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  onUpdateMobileNumber(eou: ExtendedOrgUser): void {
    this.updateMobileNumber.emit(eou);
  }

  onVerifyMobileNumber(eou: ExtendedOrgUser): void {
    this.verifyMobileNumber.emit(eou);
  }
}
