import { Component, OnInit } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  constructor(
    private googlePlus: GooglePlus,
    public platform: Platform) {
  }

  googleSignIn() {
    var clientId = 'your-android-client-id';
    this.googlePlus.login({
      webClientId: clientId,
      offline: false
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err)
    });
  };

  ngOnInit() {
  }

}
