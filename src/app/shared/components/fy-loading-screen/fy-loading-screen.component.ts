import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-fy-loading-screen',
    templateUrl: './fy-loading-screen.component.html',
    styleUrls: ['./fy-loading-screen.component.scss'],
    imports: [IonicModule],
})
export class FyLoadingScreenComponent implements OnInit {
  @Input() isSelectionModeEnabled: boolean;

  rows = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    // Placeholder for initialization logic if needed in the future.
  }
}
