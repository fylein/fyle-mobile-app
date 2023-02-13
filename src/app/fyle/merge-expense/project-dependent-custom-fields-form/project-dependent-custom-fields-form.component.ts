import { Component, Input } from '@angular/core';
import { CustomProperty } from 'src/app/core/models/custom-properties.model';
@Component({
  selector: 'app-project-dependent-custom-fields-form',
  templateUrl: './project-dependent-custom-fields-form.component.html',
  styleUrls: ['./project-dependent-custom-fields-form.component.scss'],
})
export class ProjectDependentCustomFieldsFormComponent {
  @Input() dependentFields: CustomProperty<string>[] = [];

  constructor() {}
}
