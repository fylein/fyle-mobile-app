import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-alert',
  templateUrl: './fy-alert.component.html',
  styleUrls: ['./fy-alert.component.scss'],
})
export class FyAlertComponent implements OnInit {
  @Input() type: string;

  @Input() message: string;

  constructor() {}

  ngOnInit() {}
}
