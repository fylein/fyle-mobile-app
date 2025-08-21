import { Component, OnInit, inject } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-disabled',
  templateUrl: './disabled.page.html',
  styleUrls: ['./disabled.page.scss'],
  standalone: false,
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
