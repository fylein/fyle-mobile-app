import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-select-commute-details',
  templateUrl: './fy-select-commute-details.component.html',
  styleUrls: ['./fy-select-commute-details.component.scss'],
})
export class FySelectCommuteDetailsComponent implements OnInit {
  commuteDetails: FormGroup;

  constructor(private formBuilder: FormBuilder, private modalController: ModalController) {}

  ngOnInit(): void {
    this.commuteDetails = this.formBuilder.group({
      homeLocation: [, Validators.required],
      workLocation: [, Validators.required],
    });
  }

  save(): void {
    if (this.commuteDetails.valid) {
      // TODO - Business logic to go here
    } else {
      this.commuteDetails.markAllAsTouched();
    }
  }

  close(): void {
    this.modalController.dismiss({ action: 'cancel' });
  }
}
