import { Component, OnInit, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SnakeCaseToSpaceCase } from '../../../../pipes/snake-case-to-space-case.pipe';
import { DisplayObject } from '../../../../../core/models/display-object.model';
import { ValueType } from '../../../../../core/models/statuses-diff-value-type.model';

@Component({
  selector: 'app-statuses-diff',
  templateUrl: './statuses-diff.component.html',
  styleUrls: ['./statuses-diff.component.scss'],
  imports: [TranslocoPipe, SnakeCaseToSpaceCase],
})
export class StatusesDiffComponent implements OnInit {
  readonly key = input<string>();

  readonly value = input<ValueType>();

  isValueList: boolean;

  displayValue: string;

  constructor() {}

  ngOnInit() {
    const value = this.value();
    this.isValueList = value instanceof Array;
    if (!this.isValueList) {
      this.displayValue = this.formatValue(value);
    }
  }

  private formatValue(value: ValueType): string {
    if (value === null || value === undefined) {
      return '-';
    }

    // Handle location objects with display property
    if (this.isDisplayObject(value)) {
      return value.display;
    }

    // For primitives, return as string
    return String(value);
  }

  private isDisplayObject(value: ValueType): value is DisplayObject {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      'display' in value &&
      typeof value.display === 'string'
    );
  }
}
