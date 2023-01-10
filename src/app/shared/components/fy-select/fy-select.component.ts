import { Component, OnInit, forwardRef, Input, TemplateRef, Injector, Output, EventEmitter } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NgControl,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { noop, from, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from './fy-select-modal/fy-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';

@Component({
  selector: 'app-fy-select',
  templateUrl: './fy-select.component.html',
  styleUrls: ['./fy-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectComponent),
      multi: true,
    },
  ],
})
export class FySelectComponent implements ControlValueAccessor, OnInit {
  @Input() options: { label: string; value: any }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectionElement: TemplateRef<any>;

  @Input() nullOption = true;

  @Input() cacheName = '';

  @Input() customInput = false;

  @Input() subheader = 'All';

  @Input() enableSearch = true;

  @Input() selectModalHeader = '';

  @Input() showSaveButton = false;

  @Input() placeholder: string;

  @Input() defaultLabelProp;

  @Input() recentlyUsed: { label: string; value: any; selected?: boolean }[];

  @Input() depFields;

  @Output() fgupdate = new EventEmitter<{ fg: FormGroup; action: 'ADD' | 'REMOVE' }>();

  displayValue = '';

  selectedOption;

  fg: FormGroup;

  dependentFields$;

  private innerValue;

  private ngControl: NgControl;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private injector: Injector,
    private modalProperties: ModalPropertiesService,
    private fb: FormBuilder
  ) {}

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get dependentFields() {
    return this.fg.get('dependent_fields') as FormArray;
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.displayValue = null;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }

        this.selectedOption = selectedOption;

        if (this.depFields) {
          const dependentFieldsArray = this.fg.controls.dependent_fields as FormArray;
          // dependentFieldsArray.clear();

          const mappedDependentFieldsWithControl = this.selectedOption.dependent_field_ids.map((depField) => {
            //Create array of dependent fields for the formControl
            dependentFieldsArray.push(
              this.fb.group({
                field: this.depFields.expense_fields?.data[depField].name,
                value: [null, [this.depFields.expense_fields?.data[depField].is_mandatory && Validators.required]],
              })
            );

            //Get options for dependent fields and construct an array of objects
            return {
              name: this.depFields.expense_fields?.data[depField].name,
              value: null,
              options: this.depFields.getFieldValuesById(depField).data,
              is_mandatory: this.depFields.expense_fields?.data[depField].is_mandatory,
              control: dependentFieldsArray.at(dependentFieldsArray.length - 1),
            };
          });

          this.fgupdate.emit({
            fg: this.fg,
            action: 'ADD',
          });

          console.log('mappedDependentFieldsWithControl', mappedDependentFieldsWithControl);

          //We'll be getting this from the API, so mocking it here.
          this.dependentFields$ = of(mappedDependentFieldsWithControl);

          this.dependentFields$.subscribe((res) => console.log('res', res));

          dependentFieldsArray.updateValueAndValidity();

          //Set child field value to null and mark it as untouched if parent field value changes
          // this.fg.controls.depField.setValue(null);
          // this.fg.controls.depField.markAsUntouched();
        }
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.fg = this.fb.group({
      // field: [this.label],
      // value: [],
      parent: this.label,
      dependent_fields: new FormArray([]),
    });

    // this.fg.valueChanges.subscribe((res) => console.log('FG VALUE', res));
  }

  async openModal() {
    const cssClass = this.label === 'Payment Mode' ? 'payment-mode-modal' : 'fy-modal';

    const selectionModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement,
        nullOption: this.nullOption,
        cacheName: this.cacheName,
        customInput: this.customInput,
        subheader: this.subheader,
        enableSearch: this.enableSearch,
        selectModalHeader: this.selectModalHeader || 'Select Item',
        placeholder: this.placeholder,
        showSaveButton: this.showSaveButton,
        defaultLabelProp: this.defaultLabelProp,
        recentlyUsed: this.recentlyUsed,
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(cssClass),
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.value = data.value;
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));

        if (selectedOption && selectedOption.label) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else if (this.innerValue && this.defaultLabelProp) {
          this.displayValue = this.innerValue[this.defaultLabelProp];
        } else {
          this.displayValue = '';
        }
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  updateParentFg(event) {
    // console.log('EVENT AAYA', event);
    // console.log('PARENT DEP FIELD', (this.fg.controls.dependent_fields as FormArray).controls);

    // event.fg.value.parent === this.fg.value.dependent_fields.controls[0].field

    const parentFg = (this.fg.controls.dependent_fields as FormArray).controls.find(
      (dep) => dep.value.field === event.fg.value.parent
    );

    // console.log('PARENT FG', parentFg);
    (parentFg as FormGroup).addControl('dependent_fields', event.fg.controls.dependent_fields);
  }
}
