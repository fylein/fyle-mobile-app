import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-sidemenu-header',
  templateUrl: './sidemenu-header.component.html',
  styleUrls: ['./sidemenu-header.component.scss'],
})
export class SidemenuHeaderComponent implements OnInit {
  @Input() eou: ExtendedOrgUser;

  @Input() activeOrg: Org;

  constructor(private router: Router, private menuController: MenuController) {}

  onClickProfile() {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
    this.menuController.close();
  }

  ngOnInit(): void {}
}
