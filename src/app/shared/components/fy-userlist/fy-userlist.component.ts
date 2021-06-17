import {Component, OnInit, forwardRef, Input, Injector} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import { noop, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import {FyUserlistModalComponent} from './fy-userlist-modal/fy-userlist-modal.component';
import { Employee } from 'src/app/core/models/employee.model';
import { cloneDeep } from 'lodash';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-userlist',
  templateUrl: './fy-userlist.component.html',
  styleUrls: ['./fy-userlist.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyUserlistComponent),
      multi: true
    }
  ]
})
export class FyUserlistComponent implements OnInit {
  private ngControl: NgControl;

  eouc$: Observable<Employee[]>;
  @Input() options: { label: string, value: any }[];
  @Input() disabled = false;
  @Input() label = '';
  @Input() mandatory = false;
  @Input() allowCustomValues: boolean;

  private innerValue;
  displayValue;

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
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

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FyUserlistModalComponent,
      componentProps: {
        currentSelections: cloneDeep(this.value) || [],
        allowCustomValues: this.allowCustomValues
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
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
