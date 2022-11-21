import { Component, OnInit, Input, Output } from '@angular/core';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidemenu-header',
  templateUrl: './sidemenu-header.component.html',
  styleUrls: ['./sidemenu-header.component.scss'],
})
export class SidemenuHeaderComponent implements OnInit {
  @Input() eou: ExtendedOrgUser;

  @Input() activeOrg: Org;

  @Output() profileClick = new EventEmitter();

  constructor() {}

  onClickProfile(event: Event) {
    this.profileClick.emit(event);
  }

  ngOnInit(): void {}
}
