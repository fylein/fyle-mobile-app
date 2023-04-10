import { Component, Input, OnInit } from '@angular/core';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';

@Component({
  selector: 'app-view-dependent-fields',
  templateUrl: './view-dependent-fields.component.html',
  styleUrls: ['./view-dependent-fields.component.scss'],
})
export class ViewDependentFieldsComponent implements OnInit {
  @Input() parentFieldType: 'PROJECT' | 'COST_CENTER';

  @Input() parentFieldName: string;

  @Input() parentFieldValue: string;

  @Input() costCenterCode: string;

  @Input() dependentCustomProperties: CustomProperty<string>[];

  parentFieldIcon: string;

  constructor() {}

  ngOnInit() {
    this.parentFieldIcon = this.parentFieldType === 'PROJECT' ? 'list' : 'building';
  }
}
