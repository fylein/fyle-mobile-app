import { Component, OnInit } from '@angular/core';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(
    private userEventService: UserEventService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async logout() {
    this.userEventService.logout();
    await this.authService.logout();
    await this.storageService.clearAll();
    this.router.navigate(['/', 'auth', 'sign-up']);
  }

}
