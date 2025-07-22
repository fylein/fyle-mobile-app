import { Component, OnInit } from '@angular/core';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-fy-menu-icon',
  templateUrl: './fy-menu-icon.component.html',
  styleUrls: ['./fy-menu-icon.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FyMenuIconComponent implements OnInit {
  constructor(private trackingService: TrackingService) {}

  ngOnInit() {}

  menuButtonClicked() {
    this.trackingService.menuButtonClicked();
  }
}
