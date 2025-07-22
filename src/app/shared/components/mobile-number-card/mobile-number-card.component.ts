import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-mobile-number-card',
  templateUrl: './mobile-number-card.component.html',
  styleUrls: ['./mobile-number-card.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoPipe],
})
export class MobileNumberCardComponent implements OnInit {
  @Input() extendedOrgUser: ExtendedOrgUser;

  @Output() addMobileNumberClicked = new EventEmitter<ExtendedOrgUser>();

  @Output() deleteMobileNumberClicked = new EventEmitter<void>();

  @Output() editMobileNumberClicked = new EventEmitter<ExtendedOrgUser>();

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
    this.deleteMobileNumberClicked.emit();
  }
}
