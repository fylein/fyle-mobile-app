import { Component, forwardRef, Injector, Input, OnDestroy, OnInit, TemplateRef, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { distinctUntilChanged, noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyProjectSelectModalComponent } from './fy-select-modal/fy-select-project-modal.component';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-select-project',
  templateUrl: './fy-select-project.component.html',
  styleUrls: ['./fy-select-project.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectProjectComponent),
      multi: true,
    },
  ],
})
export class FySelectProjectComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() mandatory = false;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() cacheName;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() categoryIds: string[];

  @Input() defaultValue = false;

  @Input() recentlyUsed: { label: string; value: ExtendedProject; selected?: boolean }[];

  dependantFieldConfig: {
    label: string;
    id: string;
    parent: string;
  };

  fg: FormGroup;

  displayValue;

  private ngControl: NgControl;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  // project: { id: 'something', name: 'something_else' }
  // project: { value: { id: 'something', name: 'something_else' }, dependant_fields: ... }

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector,
    private fb: FormBuilder
  ) {}

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.fg.value;
  }

  set value(v: { project: ExtendedProject; dependant_fields: any[] }) {
    this.fg.setValue(v);
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.fg = this.fb.group({
      value: [],
      dependant_field: [], // { value: , dependant_fields: ... }
    });

    this.fg.valueChanges.pipe(distinctUntilChanged()).subscribe((v) => {
      this.displayValue = v.value.name;
      this.onChangeCallback(v);
    });
  }

  ngOnDestroy(): void {}

  getDependantFieldFormGroup() {}

  async openModal() {
    const projectModal = await this.modalController.create({
      component: FyProjectSelectModalComponent,
      componentProps: {
        currentSelection: this.value,
        cacheName: this.cacheName,
        selectionElement: this.selectionElement,
        categoryIds: this.categoryIds,
        defaultValue: this.defaultValue,
        recentlyUsed: this.recentlyUsed,
        label: this.label,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await projectModal.present();

    const { data } = await projectModal.onWillDismiss();

    if (data) {
      if (data.value !== this.fg.controls.project.value) {
        this.fg.controls.project.setValue(data.value);
        this.fg.controls.dependant_field.setValue(null);
        this.dependantFieldsService.get('project', data.value).subscribe((res) => {
          this.dependantFieldConfig = res;
        });
      }
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    this.fg.setValue(value);
  }

  // validate(fc: FormControl) {
  //   if (this.mandatory && fc.value === null) {
  //     return {
  //       required: true
  //     };
  //   }
  // }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
