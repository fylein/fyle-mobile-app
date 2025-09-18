import { Component, OnInit, inject } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-disabled',
  templateUrl: './disabled.page.html',
  styleUrls: ['./disabled.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonIcon
  ],
})
export class DisabledPage implements OnInit {
  private userEventService = inject(UserEventService);

  private router = inject(Router);

  ngOnInit() {}

  onGotoSignInClick() {
    this.userEventService.logout();
    this.router.navigate(['/', 'auth', 'sign_in']);
  }
}
