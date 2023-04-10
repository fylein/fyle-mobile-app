import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';

@Component({
  selector: 'app-view-dependent-fields',
  templateUrl: './view-dependent-fields.component.html',
  styleUrls: ['./view-dependent-fields.component.scss'],
})
export class ViewDependentFieldsComponent implements OnInit {
  @Input() parentFieldId: number;

  @Input() parentFieldName: string;

  @Input() parentFieldValue: string;

  @Input() customProperties: CustomField[];

  dependentCustomProperties$: Observable<CustomProperty<string>[]>;

  constructor(private dependentFieldsService: DependentFieldsService) {}

  ngOnInit() {
    this.dependentCustomProperties$ = this.dependentFieldsService
      .getDependentFieldsForBaseField(this.parentFieldId)
      .pipe(
        map((dependentExpenseFields) =>
          dependentExpenseFields.map((dependentExpenseField) => {
            const dependentFieldValue = this.customProperties.find(
              (customProperty) => customProperty.name === dependentExpenseField.field_name
            );
            return {
              name: dependentFieldValue.name,
              value: dependentFieldValue.value || '-',
            };
          })
        ),
        shareReplay(1)
      );
  }
}
