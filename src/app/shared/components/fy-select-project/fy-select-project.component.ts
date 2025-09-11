import { Component, forwardRef, Input, OnDestroy, TemplateRef, ElementRef, inject, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { FyProjectSelectModalComponent } from './fy-select-modal/fy-select-project-modal.component';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ProjectOption } from 'src/app/core/models/project-options.model';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

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
  imports: [NgClass, FormsModule, MatIcon, TranslocoPipe],
})
export class FySelectProjectComponent implements ControlValueAccessor, OnDestroy {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() mandatory = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label: string;

  readonly placeholder = input<string>(undefined);

  readonly cacheName = input<string>(undefined);

  readonly selectionElement = input<TemplateRef<ElementRef>>(undefined);

  readonly categoryIds = input<string[]>(undefined);

  readonly defaultValue = input(false);

  readonly recentlyUsed = input<ProjectOption[]>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  readonly isProjectCategoryRestrictionsEnabled = input<boolean>(undefined);

  // eslint-disable-next-line @angular-eslint/prefer-signals
  readonly isSelectedProjectDisabled = input<boolean>(undefined);

  // eslint-disable-next-line @angular-eslint/prefer-signals
  readonly selectedDisabledProject = input<ProjectV2>(undefined);

  readonly valueChange = output<ProjectV2>();

  displayValue: string;

  innerValue: ProjectV2;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (value: ProjectV2) => void = noop;

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
        cacheName: this.cacheName(),
        selectionElement: this.selectionElement(),
        categoryIds: this.categoryIds(),
        defaultValue: this.defaultValue(),
        recentlyUsed: this.recentlyUsed(),
        label: this.label,
        isProjectCategoryRestrictionsEnabled: this.isProjectCategoryRestrictionsEnabled(),
        isSelectedProjectDisabled: this.isSelectedProjectDisabled(),
        selectedDisabledProject: this.selectedDisabledProject(),
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
