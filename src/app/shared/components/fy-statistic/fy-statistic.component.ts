import { Component, forwardRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fy-statistic',
  templateUrl: './fy-statistic.component.html',
  styleUrls: ['./fy-statistic.component.scss'],
  standalone: false,
})
export class FyStatisticComponent implements OnInit {
  @Input() icon: string;

  @Input() label: string;

  @Input() value: any;

  @Input() type: string;

  constructor() {}

  ngOnInit() {}
}
