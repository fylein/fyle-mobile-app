import { Component, OnInit, forwardRef, Input, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { noop, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyUserlistModalComponent } from './fy-userlist-modal/fy-userlist-modal.component';
import { Employee } from 'src/app/core/models/spender/employee.model';
import { cloneDeep } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-userlist',
  templateUrl: './fy-userlist.component.html',
  styleUrls: ['./fy-userlist.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyUserlistComponent),
      multi: true,
    },
  ],
  imports: [NgClass, FormsModule, MatIcon, TranslocoPipe],
})
export class FyUserlistComponent implements OnInit {
  private modalController = inject(ModalController);

  private modalProperties = inject(ModalPropertiesService);

  readonly options = input<
    {
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any;
    }[]
  >(undefined);

  readonly disabled = input(false);

  readonly label = input('');

  readonly mandatory = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() allowCustomValues: boolean;

  readonly placeholder = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() touchedInParent: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() validInParent: boolean;

  eouc$: Observable<Employee[]>;

  displayValue;

  innerValue;

  onTouchedCallback: () => void = noop;

  onChangeCallback: (_: any) => void = noop;

  get valid(): boolean {
    if (this.touchedInParent) {
      return this.validInParent;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue.join(',');
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  ngOnInit() {}

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FyUserlistModalComponent,
      componentProps: {
        currentSelections: cloneDeep(this.value) || [],
        allowCustomValues: this.allowCustomValues,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await currencyModal.present();
    const { data } = await currencyModal.onWillDismiss();

    if (data) {
      this.value = data.selected;
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue.join(',');
      } else {
        this.displayValue = '';
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
