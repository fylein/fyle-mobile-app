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
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() key;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() value;

  isValueList: boolean;

  displayValue: string;

  constructor() {}

  ngOnInit() {
    this.isValueList = this.value instanceof Array;
    if (!this.isValueList) {
      this.displayValue = this.formatValue(this.value);
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    // Handle location objects with display property
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && value.display) {
      return value.display;
    }

    // For primitives, return as string
    return String(value);
  }
}
