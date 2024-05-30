import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-employee-details-card',
  templateUrl: './employee-details-card.component.html',
  styleUrls: ['./employee-details-card.component.scss'],
})
export class EmployeeDetailsCardComponent implements OnInit {
  @Input() eou: ExtendedOrgUser;

  @Output() updateMobileNumber = new EventEmitter();

  @Output() verifyMobileNumber = new EventEmitter();

  isMobileNumberSectionVisible: boolean;

  constructor(private utilityService: UtilityService) {}

  onUpdateMobileNumber(eou: ExtendedOrgUser): void {
    this.updateMobileNumber.emit(eou);
  }

  onVerifyMobileNumber(eou: ExtendedOrgUser): void {
    this.verifyMobileNumber.emit(eou);
  }

  ngOnInit(): void {
    this.utilityService
      .isUserFromINCluster()
      .then((isUserFromINCluster) => (this.isMobileNumberSectionVisible = !isUserFromINCluster));
  }
}
