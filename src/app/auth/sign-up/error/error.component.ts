import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class SignUpErrorComponent implements OnInit {

  @Input() header = 'Error';
  @Input() status = 'Error';
  @Input() email = '';

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  async tryAgainClicked() {
    await this.popoverController.dismiss();
  }

  async goSignin() {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'auth', 'sign-in', { email: this.email }]);
  }

  async requestInvitation() {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'auth', 'request_invitation', { email: this.email }]);
  }
}
