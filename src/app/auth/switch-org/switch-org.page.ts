import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-swicth-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit {

  constructor(
  	private router: Router
  ) { }

  ngOnInit() {
  	this.router.navigate(['/', 'enterprise', 'dashboard']);
  }

}
