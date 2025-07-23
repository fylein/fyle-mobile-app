import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-fy-statistic',
    templateUrl: './fy-statistic.component.html',
    styleUrls: ['./fy-statistic.component.scss'],
    imports: [IonicModule],
})
export class FyStatisticComponent implements OnInit {
  @Input() icon: string;

  @Input() label: string;

  @Input() value: any;

  @Input() type: string;

  constructor() {}

  ngOnInit() {}
}
