import { Component, Input, OnInit } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-employee-details-card',
  templateUrl: './employee-details-card.component.html',
  styleUrls: ['./employee-details-card.component.scss'],
  standalone: false,
})
export class EmployeeDetailsCardComponent implements OnInit {
  @Input() eou: ExtendedOrgUser;

  isMobileNumberSectionVisible: boolean;

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.utilityService
      .isUserFromINCluster()
      .then((isUserFromINCluster) => (this.isMobileNumberSectionVisible = !isUserFromINCluster));
  }
}
