import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { forkJoin, noop } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  @Input() route: string[] = ['/', 'auth', 'sign_in'];

  @Input() header = '';

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.header = this.translocoService.translate('popup.errorHeader');
  }

  closeClicked(): void {
    forkJoin([this.popoverController.dismiss(), this.router.navigate(this.route)]).subscribe(noop);
  }
}
