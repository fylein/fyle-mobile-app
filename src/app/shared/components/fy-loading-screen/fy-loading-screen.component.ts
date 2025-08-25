import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-loading-screen',
  templateUrl: './fy-loading-screen.component.html',
  styleUrls: ['./fy-loading-screen.component.scss'],
  standalone: false,
})
export class FyLoadingScreenComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isSelectionModeEnabled: boolean;

  rows = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    // Placeholder for initialization logic if needed in the future.
  }
}
