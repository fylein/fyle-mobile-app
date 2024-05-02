import { Component, forwardRef, Input, OnDestroy, TemplateRef, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
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
export class FySelectProjectComponent implements ControlValueAccessor, OnDestroy {
  @Input() mandatory = false;

  @Input() label: string;

  @Input() placeholder: string;

  @Input() cacheName: string;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() categoryIds: string[];

  @Input() defaultValue = false;

  @Input() recentlyUsed: { label: string; value: ExtendedProject; selected?: boolean }[];

  @Input() touchedInParent: boolean;

  @Input() validInParent: boolean;

  displayValue;

  innerValue: ExtendedProject | string;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (value: ExtendedProject) => void = noop;

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.touchedInParent;
    } else {
      return true;
    }
  }

  get value(): ExtendedProject | string {
    return this.innerValue;
  }

  set value(v: ExtendedProject | string) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = (selectedOption as ExtendedProject).project_name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v as ExtendedProject);
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
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await projectModal.present();

    const { data }: { data?: { label: string; value: ExtendedProject; selected?: boolean } } =
      await projectModal.onWillDismiss();

    if (data) {
      this.value = data.value;
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: ExtendedProject | string[]): void {
    if (value !== this.innerValue) {
      this.innerValue = value as ExtendedProject;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.project_name;
      } else {
        this.displayValue = '';
      }
    }
  }

  registerOnChange(fn: (newValue: ExtendedProject) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
