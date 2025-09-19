import { Component, OnInit, inject } from '@angular/core';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { IonMenuButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-fy-menu-icon',
  templateUrl: './fy-menu-icon.component.html',
  styleUrls: ['./fy-menu-icon.component.scss'],
  imports: [
    IonMenuButton
  ],
})
export class FyMenuIconComponent implements OnInit {
  private trackingService = inject(TrackingService);

  ngOnInit() {}

  menuButtonClicked() {
    this.trackingService.menuButtonClicked();
  }
}
