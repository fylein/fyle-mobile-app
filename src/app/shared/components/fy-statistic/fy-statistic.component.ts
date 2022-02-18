import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-fy-statistic',
  templateUrl: './fy-statistic.component.html',
  styleUrls: ['./fy-statistic.component.scss'],
})
export class FyStatisticComponent implements OnInit {
  @Input() icon: any;

  @Input() label: string;

  @Input() value: any;

  @Input() type: any;

  constructor() {}

  ngOnInit() {}
}
