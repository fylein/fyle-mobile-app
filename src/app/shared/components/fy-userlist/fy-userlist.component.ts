import {Component, OnInit, forwardRef, Input, Injector} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import { noop, Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { FyMultiselectModalComponent } from '../fy-multiselect/fy-multiselect-modal/fy-multiselect-modal.component';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { map } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';

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

  eouc$: Observable<ExtendedOrgUser[]>;
  @Input() options: { label: string, value: any }[];
  @Input() disabled = false;
  @Input() label = '';
  @Input() mandatory = false;

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
    private orgUserService: OrgUserService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);

    this.eouc$ = this.orgUserService.getAllCompanyEouc();

    this.eouc$.pipe(
      map(eous => eous.map(eou => ({ label: eou.us.email, value: eou.us.email })))
    ).subscribe((options) => {
      this.options = options;
    });
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue
            .join(',');
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const currencyModal = await this.modalController.create({
      component: FyMultiselectModalComponent,
      componentProps: {
        options: this.options,
        currentSelections: this.value
      }
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();

    if (data) {
      this.value = data.selected.map(selection => selection.value);
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.innerValue && this.innerValue.length > 0) {
        this.displayValue = this.innerValue
            .join(',');
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
