import { Component, OnInit, input } from '@angular/core';

@Component({
  selector: 'app-fy-statistic',
  templateUrl: './fy-statistic.component.html',
  styleUrls: ['./fy-statistic.component.scss'],
  imports: [IonicModule],
})
export class FyStatisticComponent implements OnInit {
  readonly icon = input<string>(undefined);

  readonly label = input<string>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly value = input<any>(undefined);

  readonly type = input<string>(undefined);

  constructor() {}

  ngOnInit() {}
}
