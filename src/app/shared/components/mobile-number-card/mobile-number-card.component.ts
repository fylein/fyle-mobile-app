import { Component, Input, OnInit, output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-mobile-number-card',
  templateUrl: './mobile-number-card.component.html',
  styleUrls: ['./mobile-number-card.component.scss'],
  imports: [IonicModule, TranslocoPipe],
})
export class MobileNumberCardComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() extendedOrgUser: ExtendedOrgUser;

  readonly addMobileNumberClicked = output<ExtendedOrgUser>();

  readonly deleteMobileNumberClicked = output<void>();

  readonly editMobileNumberClicked = output<ExtendedOrgUser>();

  mobileNumber: string;

  ngOnInit(): void {
    this.mobileNumber = this.extendedOrgUser.ou.mobile;
  }

  clickedOnAdd(): void {
    this.addMobileNumberClicked.emit(this.extendedOrgUser);
  }

  editMobileNumber(): void {
    this.editMobileNumberClicked.emit(this.extendedOrgUser);
  }

  deleteMobileNumber(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.deleteMobileNumberClicked.emit();
  }
}
