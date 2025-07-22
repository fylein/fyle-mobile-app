import { Component, OnInit } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-disabled',
  templateUrl: './disabled.page.html',
  styleUrls: ['./disabled.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class DisabledPage implements OnInit {
  constructor(private userEventService: UserEventService, private router: Router) {}

  ngOnInit() {}

  onGotoSignInClick() {
    this.userEventService.logout();
    this.router.navigate(['/', 'auth', 'sign_in']);
  }
}
