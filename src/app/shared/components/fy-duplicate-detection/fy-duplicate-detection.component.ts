import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { DuplicateDetectionService } from 'src/app/core/services/duplicate-detection.service';
import { FyDuplicateDetectionModalComponent } from './fy-duplicate-detection-modal/fy-duplicate-detection-modal.component';
import { isEqual } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-duplicate-detection',
  templateUrl: './fy-duplicate-detection.component.html',
  styleUrls: ['./fy-duplicate-detection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyDuplicateDetectionComponent),
      multi: true,
    },
  ],
})
export class FyDuplicateDetectionComponent implements OnInit, ControlValueAccessor {
  @Input() duplicates: any;

  @Input() transactionId: any;

  @Input() label;

  @Input() mandatory;

  options: { label: string; value: any }[];

  displayValue;

  private innerValue;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private duplicateDetectionService: DuplicateDetectionService
  ) {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption) {
          this.displayValue = selectedOption && selectedOption.label;
        }
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.options = this.duplicateDetectionService
      .getDuplicateReasons()
      .map((reason) => ({ label: reason, value: reason }));
  }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: FyDuplicateDetectionModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
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
        this.displayValue = selectedOption && selectedOption.label;
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
