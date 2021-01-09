import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop, from, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {LoadingController, ModalController, ToastController} from '@ionic/angular';
import { SelectionModalComponent } from './selection-modal/selection-modal.component';
import { SignupDetailsService } from 'src/app/core/services/signup-details.service';
import { map, tap, switchMap, finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { Plugins } from '@capacitor/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';

const { Browser } = Plugins;

enum SignUpDetailsPageState {
  firstForm,
  secondForm
}

@Component({
  selector: 'app-signup-details-enterprise',
  templateUrl: './signup-details-enterprise.page.html',
  styleUrls: ['./signup-details-enterprise.page.scss'],
})
export class SignupDetailsEnterprisePage implements OnInit {

  isConnected$: Observable<boolean>;
  fg: FormGroup;
  sfg: FormGroup;
  currentUserEmail: string;
  currentState: SignUpDetailsPageState = SignUpDetailsPageState.firstForm;
  lengthValidationDisplay$: Observable<boolean>;
  uppercaseValidationDisplay$: Observable<boolean>;
  numberValidationDisplay$: Observable<boolean>;
  specialCharValidationDisplay$: Observable<boolean>;
  hide = true;
  regions: string[] = [];
  preVerificationLoader = false;
  finalSignupLoading = false;

  get PageStates() {
    return SignUpDetailsPageState;
  }

  constructor(
    private activateRoute: ActivatedRoute,
    private networkService: NetworkService,
    private fb: FormBuilder,
    private modalController: ModalController,
    private signUpDetailsService: SignupDetailsService,
    private toastController: ToastController,
    private userService: UserService,
    private routerAuthService: RouterAuthService,
    private loaderService: LoaderService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.currentUserEmail = this.activateRoute.snapshot.params.email;

    this.fg = this.fb.group({
      role: [, Validators.required],
      count: [, Validators.required]
    });

    this.sfg = this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required],
      region: ['', Validators.required],
      password: ['', Validators.compose(
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(32),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[0-9]/),
          Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/)]
      )],
      phone: [''],
      tos: [false, Validators.requiredTrue]
    });

    this.userService.getCountryFromIp().subscribe(country => {
      this.sfg.controls.country.setValue(country);
    });

    this.signUpDetailsService.getRegionList().subscribe(regions => {
      this.regions = regions;
    });

    this.lengthValidationDisplay$ = this.sfg.controls.password.valueChanges.pipe(
      map(
        password => password && password.length >= 12 && password.length <= 32
      )
    );

    this.uppercaseValidationDisplay$ = this.sfg.controls.password.valueChanges.pipe(
      map(
        password => (/[A-Z]/.test(password))
      )
    );

    this.numberValidationDisplay$ = this.sfg.controls.password.valueChanges.pipe(
      map(
        password => (/[0-9]/.test(password))
      )
    );
    this.specialCharValidationDisplay$ = this.sfg.controls.password.valueChanges.pipe(
      map(
        password => (/[!@#$%^&*()+\-:;<=>{}|~?]/.test(password))
      )
    );
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);
  }

  async openRoleDialog() {
    const roles = this.signUpDetailsService.getRolesList();
    const modal = await this.modalController.create({
      component: SelectionModalComponent,
      componentProps: {
        header: 'Choose your role',
        selectionItems: roles,
        selectedValue: this.fg.controls.role.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fg.controls.role.setValue(data.selection);
    }
  }

  async openEmployeeCountDialog() {
    const employeeRanges = this.signUpDetailsService.getEmployeeRangeList();
    const modal = await this.modalController.create({
      component: SelectionModalComponent,
      componentProps: {
        header: 'Choose Employee Count',
        selectionItems: employeeRanges,
        selectedValue: this.fg.controls.count.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fg.controls.count.setValue(data.selection);
    }
  }

  async openCountryDialog() {
    const countries = this.signUpDetailsService.getCountryList();
    const modal = await this.modalController.create({
      component: SelectionModalComponent,
      componentProps: {
        header: 'Choose Country',
        selectionItems: countries,
        selectedValue: this.sfg.controls.country.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.sfg.controls.country.setValue(data.selection);
    }
  }

  async openRegionDialog() {
    const modal = await this.modalController.create({
      component: SelectionModalComponent,
      componentProps: {
        header: 'Choose Region',
        selectionItems: this.regions,
        selectedValue: this.sfg.controls.region.value
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.sfg.controls.region.setValue(data.selection);
    }
  }

  async continue() {
    this.preVerificationLoader = true;
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      this.currentState = this.PageStates.secondForm;
      // TODO: Add when Tracking is added
      // rasing event called choose persona with persona details that the user filled up in last form
      // TrackingService.onChosingPersona({Asset: 'Mobile', Persona: 'Enterprise'});
      // // setting up company details in clevertap profile
      // TrackingService.updateSegmentProfile({
      //   'Account Type': 'Enterprise',
      //   'Employee Size': vm.employeeCount,
      //   'Title': vm.title
      // });

    } else {
      const toast = await this.toastController.create({
        message: 'Please fill all required fields to proceed',
        color: 'danger',
        duration: 1200
      });

      this.preVerificationLoader = false;
      await toast.present();
    }
  }

  async openLinkInApp(url: string) {
    await Browser.open({ url });
  }

  async signUp() {
    this.sfg.markAllAsTouched();
    if (this.sfg.valid) {
      this.finalSignupLoading = true;
      const signupParams = {
        auth: 'email',
        asset: 'mobile',
        employee_count: this.fg.value.count,
        country: this.sfg.value.country,
        region: this.sfg.value.region,
        employee_type: null
      };
      this.routerAuthService.basicSignup(
        this.activateRoute.snapshot.params.email,
        this.sfg.value.name,
        this.fg.value.role,
        this.sfg.value.phone.trim() === '' ? null : this.sfg.value.phone.trim(),
        signupParams,
        'enterprise',
        this.sfg.value.password,
        this.sfg.value.region
      ).pipe(
        tap(() => {
          // setting up user details in clevertap profile
          // TrackingService.updateSegmentProfile({
          //   '$name': vm.fullName,
          //   '$country': vm.country,
          //   'Region': vm.region
          //   // Phone number should be formatted as +[country code][number], have to fix
          //   // "Phone": ("" + vm.country.code + vm.phoneNumber)
          // });
        }),
        finalize(() => this.finalSignupLoading = false),
        tap(() => {
          // TODO: on Signup
          // TrackingService.onSignup($stateParams.email, {Asset: 'Mobile', label: 'Email'});
        })
      ).subscribe(res => {
        this.router.navigate(['/', 'pre_verification', 'verify_email',
          {
            email: this.activateRoute.snapshot.params.email,
            name: this.sfg.value.name
          }
        ]);
      }, async err => {
        const errorMessage = await this.loadingController.create({
          message: 'Something went wrong.Please try again',
          duration: 1000,
          spinner: null
        });

        await errorMessage.present();
      });
    } else {
      const toast = await this.toastController.create({
        message: 'Please fill all required fields to proceed',
        color: 'danger',
        duration: 1200
      });

      await toast.present();
    }
  }
}
