import { ChangeDetectorRef, Component, forwardRef, Input, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { noop } from 'rxjs';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { DependentFieldModalComponent } from './dependent-field-modal/dependent-field-modal.component';

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
  standalone: false,
})
export class DependentFieldComponent implements ControlValueAccessor {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  private cdr = inject(ChangeDetectorRef);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label = '';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() placeholder: string;

  readonly mandatory = input(false);

  readonly valid = input(true);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() fieldId: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() parentFieldId: number;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() parentFieldValue: string;

  displayValue: string;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: unknown) => void = noop;

  async openModal(): Promise<void> {
    const selectionModal = await this.modalController.create({
      component: DependentFieldModalComponent,
      componentProps: {
        currentSelection: this.displayValue,
        placeholder: this.placeholder,
        label: this.label,
        fieldId: this.fieldId,
        parentFieldId: this.parentFieldId,
        parentFieldValue: this.parentFieldValue,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await selectionModal.present();

    const { data } = (await selectionModal.onWillDismiss()) as {
      data: {
        value: string;
      };
    };

    if (data) {
      this.displayValue = data.value;
      this.onChangeCallback(this.displayValue);
      this.cdr.detectChanges();
    }
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(val: string): void {
    this.displayValue = val;
  }

  registerOnChange(fn: (_: unknown) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
