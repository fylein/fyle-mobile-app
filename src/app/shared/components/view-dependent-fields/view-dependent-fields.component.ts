import { Component, Input, OnInit } from '@angular/core';
import { CustomField } from 'src/app/core/models/custom_field.model';

@Component({
  selector: 'app-view-dependent-fields',
  templateUrl: './view-dependent-fields.component.html',
  styleUrls: ['./view-dependent-fields.component.scss'],
})
export class ViewDependentFieldsComponent implements OnInit {
  @Input() parentFieldName: string;

  @Input() parentFieldValue: string;

  @Input() customProperties: CustomField[];

  constructor() {}

  ngOnInit() {}
}
