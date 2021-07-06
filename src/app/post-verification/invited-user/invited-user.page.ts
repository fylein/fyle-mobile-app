import { Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, noop, concat, from } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {map, switchMap, finalize, tap} from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import {TrackingService} from '../../core/services/tracking.service';

@Component({
  selector: 'app-invited-user',
  templateUrl: './invited-user.page.html',
  styleUrls: ['./invited-user.page.scss'],
})
export class InvitedUserPage implements OnInit {

  isConnected$: Observable<boolean>;
  fg: FormGroup;
  eou$: Observable<ExtendedOrgUser>;
  hide = true;
  lengthValidationDisplay$: Observable<boolean>;
  uppercaseValidationDisplay$: Observable<boolean>;
  numberValidationDisplay$: Observable<boolean>;
  specialCharValidationDisplay$: Observable<boolean>;
  lowercaseValidationDisplay$: Observable<boolean>;

  constructor(
    private networkService: NetworkService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private orgUserService: OrgUserService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router,
    private trackingService: TrackingService
  ) { }

  ngOnInit() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);

    this.fg = this.fb.group({
      fullName: ['', Validators.required],
      password: ['',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(12),
            Validators.maxLength(32),
            Validators.pattern(/[A-Z]/),
            Validators.pattern(/[0-9]/),
            Validators.pattern(/[!@#$%^&*()+\-:;<=>{}|~?]/)]
        )]
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

    this.lowercaseValidationDisplay$ = this.fg.controls.password.valueChanges.pipe(
      map(
        password => (/[a-z]/.test(password))
      )
    );

    this.eou$ = from(this.authService.getEou());

    this.eou$.subscribe((eou) => {
      this.fg.controls.fullName.setValue(eou.us.full_name);
    });
  }

  async saveData() {
    this.fg.markAllAsTouched();
    if (this.fg.valid) {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          return this.eou$;
        }),
        switchMap((eou) => {
          const user = eou.us;
          user.full_name = this.fg.controls.fullName.value;
          user.password = this.fg.controls.password.value;
          return this.orgUserService.postUser(user);
        }),
        tap(() => this.trackingService.setupComplete({Asset: 'Mobile'})),
        switchMap(() => {
          return this.authService.refreshEou();
        }),
        switchMap(() => {
          return this.orgUserService.markActive();
        }),
        tap(() => this.trackingService.activated({Asset: 'Mobile'})),
        finalize(async () => await this.loaderService.hideLoader())
      ).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        // return $state.go('enterprise.my_dashboard');
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
