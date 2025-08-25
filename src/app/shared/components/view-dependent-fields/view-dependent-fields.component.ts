import { Component, Input, OnInit, input } from '@angular/core';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';

@Component({
  selector: 'app-view-dependent-fields',
  templateUrl: './view-dependent-fields.component.html',
  styleUrls: ['./view-dependent-fields.component.scss'],
  standalone: false,
})
export class ViewDependentFieldsComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() parentFieldType: 'PROJECT' | 'COST_CENTER';

  readonly parentFieldName = input<string>(undefined);

  readonly parentFieldValue = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() costCenterCode: string;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() dependentCustomProperties: CustomProperty<string>[];

  parentFieldIcon: string;

  ngOnInit(): void {
    this.parentFieldIcon = this.parentFieldType === 'PROJECT' ? 'list' : 'building';
  }
}
