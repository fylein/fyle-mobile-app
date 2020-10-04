import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { forkJoin, noop } from 'rxjs';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {

  @Input() header = 'Error';
  @Input() route: string[] = ['/', 'auth', 'sign-in'];

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  closeClicked() {
    forkJoin([
      this.popoverController.dismiss(),
      this.router.navigate(this.route)
    ]).subscribe(noop);
  }

}
