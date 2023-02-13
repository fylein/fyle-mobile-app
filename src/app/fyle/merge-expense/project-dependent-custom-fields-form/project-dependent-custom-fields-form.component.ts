import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';

type Option = Partial<{
  label: string;
  value: any;
}>;

type CustomInput = Partial<{
  control: AbstractControl;
  id: string;
  mandatory: boolean;
  name: string;
  options: Option[];
  placeholder: string;
  prefix: string;
  type: string;
  value: string;
  parent_field_id: number;
}>;

@Component({
  selector: 'app-project-dependent-custom-fields-form',
  templateUrl: './project-dependent-custom-fields-form.component.html',
  styleUrls: ['./project-dependent-custom-fields-form.component.scss'],
})
export class ProjectDependentCustomFieldsFormComponent implements OnChanges {
  @Input() projectDependentFieldsMapping: { [projectId: number]: CustomProperty<string>[] };

  @Input() selectedProjectId: number;

  dependentInputs: CustomProperty<string>[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedProjectId?.currentValue) {
      this.dependentInputs = this.projectDependentFieldsMapping[changes.selectedProjectId.currentValue];
    }
  }
}
