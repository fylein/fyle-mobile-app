import { Component, computed, input } from '@angular/core';
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
export class StatusesDiffComponent {
  readonly key = input<string>();

  readonly value = input<ValueType>();

  readonly isValueList = computed(() => this.value() instanceof Array);

  readonly displayValue = computed(() => (this.isValueList() ? '' : this.formatValue(this.value())));

  readonly shouldShowDetails = computed(() => !this.isEmptyObject(this.value()));

  // Filters out invalid values (null, undefined, empty objects) that shouldn't be displayed in audit history
  private isEmptyObject(value: ValueType): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'object') {
      if (this.isDisplayObject(value)) {
        return false;
      }
      return Object.keys(value).length === 0;
    }

    return false;
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
