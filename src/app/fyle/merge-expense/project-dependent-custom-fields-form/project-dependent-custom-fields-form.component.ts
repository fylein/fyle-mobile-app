import { Component, Input, OnChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';

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
  @Input() customInputs: CustomInput[];

  @Input() projectCustomInputsMapping;

  @Input() selectedProject;

  customFields: CustomInput[];

  constructor() {}

  generateCustomForm() {
    this.customInputs = this.customInputs.map((customInput) => {
      console.log(customInput.name, this.projectCustomInputsMapping[this.selectedProject][customInput.name]);
      return {
        ...customInput,
        value: this.projectCustomInputsMapping[this.selectedProject][customInput.name],
      };
    });
  }

  ngOnChanges() {
    this.generateCustomForm();
  }
}
