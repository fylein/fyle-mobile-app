import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-get-started-popup',
  templateUrl: './get-started-popup.component.html',
  styleUrls: ['./get-started-popup.component.scss'],
})
export class GetStartedPopupComponent implements OnInit {
  gettingStartedImagesAndInfos$: Observable<any>;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController
  ) { }

  close() {
    this.popoverController.dismiss();
  }

  ngOnInit() {
    this.gettingStartedImagesAndInfos$ = from(this.authService.getEou()).pipe(
      map(eou => [{
          src: '../../../assets/images/get-started-illustration.png',
          heading: 'Hey, '+ eou.us.full_name ,
          info: 'We\'re about to make expense reports a thing of delight for you!'
        }, {
          src: '../../../assets/images/gs-illustartion-mobile-01.png',
          heading: 'Track Receipts & Log Mileage',
          info: 'Automatic data extraction from paper receipts.'
        }, {
          src: '../../../assets/images/gs-illustartion-mobile-02.png',
          heading: 'Fyle inside Gmail & Outlook',
          info: 'One click expense claims inside your inbox.'
        }])
    );

  }
}
