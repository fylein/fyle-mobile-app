import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  @Input() header = 'Account does not Exist';

  @Input() error;

  constructor(private popoverController: PopoverController, private router: Router) {}

  ngOnInit() {}

  async tryAgainClicked() {
    await this.popoverController.dismiss();
  }

  async routeTo(route: string[]) {
    this.router.navigate(route);
    await this.popoverController.dismiss();
  }
}
