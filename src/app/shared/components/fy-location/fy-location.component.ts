import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FySelectModalComponent } from '../fy-select/fy-select-modal/fy-select-modal.component';

@Component({
  selector: 'app-fy-location',
  templateUrl: './fy-location.component.html',
  styleUrls: ['./fy-location.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyLocationComponent),
      multi: true
    }
  ]
})
export class FyLocationComponent implements ControlValueAccessor, OnInit {

  @Input() label = 'location';
  @Input() mandatory = false;
  @Input() disabled = false;

  private innerValue;
  displayValue;

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.projectv2_name;
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FySelectModalComponent,
      componentProps: {
        currentSelection: this.value
      }
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();

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
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.projectv2_name;
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
