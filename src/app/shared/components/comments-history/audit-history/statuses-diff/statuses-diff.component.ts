import { Component, OnInit, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SnakeCaseToSpaceCase } from '../../../../pipes/snake-case-to-space-case.pipe';

@Component({
    selector: 'app-statuses-diff',
    templateUrl: './statuses-diff.component.html',
    styleUrls: ['./statuses-diff.component.scss'],
    imports: [TranslocoPipe, SnakeCaseToSpaceCase],
})
export class StatusesDiffComponent implements OnInit {
  @Input() key;

  @Input() value;

  isValueList: boolean;

  constructor() {}

  ngOnInit() {
    this.isValueList = this.value instanceof Array;
  }
}
