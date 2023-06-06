import { Injectable } from '@angular/core';
import { BackButtonActionPriority } from '../models/back-button-action-priority.enum';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PlatformHandlerService {
  constructor(private platform: Platform) {}

  registerBackButtonAction(priority: BackButtonActionPriority, callback: () => void): void {
    this.platform.backButton.subscribeWithPriority(priority, callback);
  }
}
