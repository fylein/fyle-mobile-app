import { Component, forwardRef, Input, OnDestroy, TemplateRef, ElementRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyProjectSelectModalComponent } from './fy-select-modal/fy-select-project-modal.component';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ProjectOption } from 'src/app/core/models/project-options.model';

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
  standalone: false,
})
export class FySelectProjectComponent implements ControlValueAccessor, OnDestroy {
  @Input() mandatory = false;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() cacheName: string;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() categoryIds: string[];

  @Input() defaultValue = false;

  @Input() recentlyUsed: ProjectOption[];

  @Input() touchedInParent: boolean;

  @Input() validInParent: boolean;

  @Input() isProjectCategoryRestrictionsEnabled: boolean;

  @Output() valueChange = new EventEmitter<ProjectV2>();

  displayValue: string;

  innerValue: ProjectV2;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (value: ProjectV2) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
  ) {}

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.touchedInParent;
    } else {
      return true;
    }
  }

  get value(): ProjectV2 {
    return this.innerValue;
  }

  set value(v: ProjectV2) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.project_name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
      this.valueChange.emit(v);
    }
  }

  ngOnDestroy(): void {
    return;
  }

  async openModal(): Promise<void> {
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
        isProjectCategoryRestrictionsEnabled: this.isProjectCategoryRestrictionsEnabled,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await projectModal.present();

    const { data }: { data?: ProjectOption } = await projectModal.onWillDismiss();

    if (data) {
      this.value = data.value;
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: ProjectV2): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.project_name;
      } else {
        this.displayValue = '';
      }
    }
  }

  registerOnChange(fn: (newValue: ProjectV2) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
