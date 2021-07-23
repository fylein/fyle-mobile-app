import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-alert-info',
  templateUrl: './fy-alert-info.component.html',
  styleUrls: ['./fy-alert-info.component.scss'],
})
export class FyAlertInfoComponent implements OnInit {

  @Input() message: string;
  @Input() type: string;

  constructor() { }

  ngOnInit() {}

}
