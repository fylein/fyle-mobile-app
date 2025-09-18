import { Component, Input, OnInit, inject } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NgClass, UpperCasePipe } from '@angular/common';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';


@Component({
  selector: 'app-employee-details-card',
  templateUrl: './employee-details-card.component.html',
  styleUrls: ['./employee-details-card.component.scss'],
  imports: [
    InitialsPipe,
    IonCol,
    IonGrid,
    IonRow,
    NgClass,
    TranslocoPipe,
    UpperCasePipe
  ],
})
export class EmployeeDetailsCardComponent implements OnInit {
  private utilityService = inject(UtilityService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() eou: ExtendedOrgUser;

  isMobileNumberSectionVisible: boolean;

  ngOnInit(): void {
    this.utilityService
      .isUserFromINCluster()
      .then((isUserFromINCluster) => (this.isMobileNumberSectionVisible = !isUserFromINCluster));
  }
}
