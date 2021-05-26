import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FooterState } from 'src/app/shared/components/footer/footer-state';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {

  get FooterState() {
    return FooterState;
  }

  constructor(
      private router: Router
  ) { }

  ngOnInit() {
  }

  onHomeClicked() {
    this.router.navigate(['/', 'enterprise', 'my_dashboard']);
  }

  onCameraClicked() {
    this.router.navigate(['/', 'enterprise', 'camera_overlay']);
  }
}
