import { Component, OnInit } from '@angular/core';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  constructor(
    private routerAuthService: RouterAuthService,
    private router: Router,
    private menuController: MenuController
  ) { }

  async ngOnInit() {
    await this.menuController.enable(false);
    const isLoggedIn = await this.routerAuthService.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/', 'auth', 'switch-org', { choose: false }]);
    }
  }

}
