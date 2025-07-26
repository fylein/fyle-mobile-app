import { Component, OnInit } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-disabled',
  templateUrl: './disabled.page.html',
  styleUrls: ['./disabled.page.scss'],
  standalone: false,
})
export class DisabledPage implements OnInit {
  constructor(private userEventService: UserEventService, private router: Router) {}

  ngOnInit() {}

  onGotoSignInClick() {
    this.userEventService.logout();
    this.router.navigate(['/', 'auth', 'sign_in']);
  }
}
