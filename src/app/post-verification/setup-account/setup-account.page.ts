import { Component, OnInit, EventEmitter } from '@angular/core';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop, from } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { map, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { OrgService } from 'src/app/core/services/org.service';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-setup-account',
  templateUrl: './setup-account.page.html',
  styleUrls: ['./setup-account.page.scss'],
})
export class SetupAccountPage implements OnInit {

  isConnected$: Observable<boolean>;
  eou$: Observable<ExtendedOrgUser>;
  fullname$: Observable<string>;
  fg: FormGroup;
  org$: Observable<Org>;

  lengthValidationDisplay$: Observable<boolean>;
  uppercaseValidationDisplay$: Observable<boolean>;
  numberValidationDisplay$: Observable<boolean>;
  specialCharValidationDisplay$: Observable<boolean>;

  constructor(
    private networkService: NetworkService,
    private authService: AuthService,
    private fb: FormBuilder,
    private modalController: ModalController,
    private orgService: OrgService,
    private toastController: ToastController
  ) { }


  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);
  }

  async openCurrenySelectionModal() {
    const modal = await this.modalController.create({
      component: SelectCurrencyComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fg.controls.homeCurrency.setValue(data.currency.shortCode);
    }
  }

  async saveData() {
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      // do valid shit
    } else {
      const toast = await this.toastController.create({
        message: 'Please fill all required fields to proceed',
        color: 'danger',
        duration: 1200
      });

      await toast.present();
    }
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.eou$ = from(this.authService.getEou());
    this.fullname$ = this.eou$.pipe(
      map(
        eou => eou.us.full_name
      )
    );

    this.fg = this.fb.group({
      companyName: ['', Validators.required],
      homeCurrency: ['', Validators.required],
      password: ['',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(12),
            Validators.maxLength(32),
            Validators.pattern(/[A-Z]/),
            Validators.pattern(/[0-9]/),
            Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/)]
        )
      ]
    });

    this.org$ = this.orgService.setCurrencyBasedOnIp().pipe(
      switchMap(() => {
        return this.orgService.getCurrentOrg();
      })
    );

    this.org$.subscribe((org) => {
      this.fg.controls.homeCurrency.setValue(org.currency);
    });

    this.lengthValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => password && password.length >= 12 && password.length <= 32
      )
    );

    this.uppercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[A-Z]/.test(password))
      )
    );

    this.numberValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[0-9]/.test(password))
      )
    );
    this.specialCharValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[!@#$%^&*()+\-:;<=>{}|~?]/.test(password))
      )
    );
  }

}
