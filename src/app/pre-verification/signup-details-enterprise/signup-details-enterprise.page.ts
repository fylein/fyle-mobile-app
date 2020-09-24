import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { SelectionModalComponent } from './selection-modal/selection-modal.component';
import { SignupDetailsService } from 'src/app/core/services/signup-details.service';

enum SignUpDetailsPageState {

}

@Component({
  selector: 'app-signup-details-enterprise',
  templateUrl: './signup-details-enterprise.page.html',
  styleUrls: ['./signup-details-enterprise.page.scss'],
})
export class SignupDetailsEnterprisePage implements OnInit {

  isConnected$: Observable<boolean>;
  fg: FormGroup;
  currentUserEmail: string;

  constructor(
    private activateRoute: ActivatedRoute,
    private networkService: NetworkService,
    private fb: FormBuilder,
    private modalController: ModalController,
    private signUpDetailsService: SignupDetailsService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.currentUserEmail = this.activateRoute.snapshot.params.email;

    this.fg = this.fb.group({
      role: [, Validators.required],
      count: [, Validators.required]
    });

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
        selectionItems: roles
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
        selectionItems: employeeRanges
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fg.controls.count.setValue(data.selection);
    }
  }

  async continue() {
    this.fg.markAllAsTouched();
    if (this.fg.valid) {

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
