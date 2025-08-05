import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TrackingService } from '../../../core/services/tracking.service';

@Component({
  selector: 'app-camera-options-popup',
  templateUrl: './camera-options-popup.component.html',
  styleUrls: ['./camera-options-popup.component.scss'],
  standalone: false,
})
export class CameraOptionsPopupComponent implements OnInit {
  @Input() mode: string;

  constructor(
    private popoverController: PopoverController,
    private trackingService: TrackingService,
  ) {}

  ngOnInit(): void {
    return;
  }

  closeClicked(): void {
    this.popoverController.dismiss();
  }

  async getImageFromPicture(): Promise<void> {
    const mode = this.mode === 'edit' ? 'Edit Expense' : 'Add Expense';
    this.trackingService.addAttachment({ Mode: mode, Category: 'Camera' });
    this.popoverController.dismiss({ option: 'camera' });
  }

  async getImageFromImagePicker(): Promise<void> {
    const mode = this.mode === 'edit' ? 'Edit Expense' : 'Add Expense';
    this.trackingService.addAttachment({ Mode: mode, Category: 'Gallery' });
    this.popoverController.dismiss({ option: 'gallery' });
  }
}
