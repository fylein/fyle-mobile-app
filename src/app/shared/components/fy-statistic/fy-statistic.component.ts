import { Component, OnInit, input } from '@angular/core';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/angular/standalone';


@Component({
  selector: 'app-fy-statistic',
  templateUrl: './fy-statistic.component.html',
  styleUrls: ['./fy-statistic.component.scss'],
  imports: [
    IonCol,
    IonGrid,
    IonIcon,
    IonRow
  ],
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
