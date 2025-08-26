import { Component, OnInit, Input, output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-sidemenu-header',
  templateUrl: './sidemenu-header.component.html',
  styleUrls: ['./sidemenu-header.component.scss'],
  standalone: false,
})
export class SidemenuHeaderComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() eou: ExtendedOrgUser;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() activeOrg: Org;

  readonly profileClicked = output<Event>();

  constructor() {}

  onProfileClicked(event: Event) {
    this.profileClicked.emit(event);
  }

  ngOnInit(): void {}
}
