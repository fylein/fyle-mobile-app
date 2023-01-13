import { Component, OnInit, forwardRef, Input, TemplateRef, Injector, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BehaviorSubject, noop, skip, tap } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from '../fy-select/fy-select-modal/fy-select-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-dependent-field',
  templateUrl: './dependent-field.component.html',
  styleUrls: ['./dependent-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependentFieldComponent),
      multi: true,
    },
  ],
})
export class DependentFieldComponent implements OnInit, ControlValueAccessor, OnChanges {
  @Input() options: { label: string; value: any; dependent_field_id: number }[] = [];

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

  @Input() touchedInParent: BehaviorSubject<boolean>;

  newlyAdded = true;

  fg: FormGroup;

  dependentField;

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
    if (this.fg.controls.value.touched) {
      return this.fg.controls.value.valid;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.fg.value.value;
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.fg = this.fb.group({
      field: [this.label],
      value: [null, [Validators.required]],
      dependent_field: [null, [Validators.required]],
    });

    this.touchedInParent
      .pipe(
        tap((x) => console.log(x, this.label)),
        skip(1),
        tap((x) => console.log(x, this.label + 'lalalal'))
      )
      .subscribe(() => {
        this.fg.controls.value.markAsTouched();
      });

    this.fg.valueChanges.subscribe((val) => {
      // console.log('IS form valid', this.label, this.fg.controls.value.valid);
      // console.log('IS dependent_field valid', this.label, this.fg.controls.dependent_field.valid);
      this.onChangeCallback(val);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    //Update the form when parent field changes
    if (changes.label && !changes.label.firstChange) {
      this.fg?.patchValue({
        field: changes.label.currentValue,
        value: null,
        dependent_field: null,
      });
      this.dependentField = null;
    }
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
      this.fg.patchValue({
        value: data.value,
        dependent_field: null,
      });
      const selectedOption = this.options.find((option) => isEqual(option.value, data.value));
      const dependentFieldId = selectedOption.dependent_field_id;
      this.dependentField = null;
      if (!!dependentFieldId) {
        this.dependentField = {
          name: this.depFields.expense_fields?.data[dependentFieldId].name,
          value: null,
          options: this.depFields.getFieldValuesById(dependentFieldId).data,
          is_mandatory: this.depFields.expense_fields?.data[dependentFieldId].is_mandatory,
        };
      }
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    this.fg.patchValue(value);
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  showError() {
    // console.log(this.fg.controls.dependent_field.touched, this.fg.controls.dependent_field.valid);
    return this.fg.controls.dependent_field.touched && !this.fg.controls.dependent_field.valid;
  }
}
