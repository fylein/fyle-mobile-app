import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fy-loading-screen',
    templateUrl: './fy-loading-screen.component.html',
    styleUrls: ['./fy-loading-screen.component.scss'],
})
export class FyLoadingScreenComponent implements OnInit {
  rows = [1, 2, 3, 4, 5];

  constructor() { }

  ngOnInit() {
  }

}
