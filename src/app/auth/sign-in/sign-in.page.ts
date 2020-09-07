import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  fg: FormGroup;
  emailExists = false;
  emailEdit = false;

  constructor(
    private formBuilder: FormBuilder,
    private routerAuthService: RouterAuthService
  ) { }

  checkIfEmailExists() {
    const isEmailValid = this.fg.controls.email.valid;
    if (isEmailValid) {
      this.routerAuthService
        .checkEmailExists(this.fg.controls.email.value)
        .subscribe((res) => {
          if (res.saml) {
            // do saml stuff
          } else {
            this.emailExists = true;
          }
        });
    }
  }

  signInUser() {

  }

  ngOnInit() {
    this.fg = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')])],
      password: ['', Validators.required]
    });
  }
}
