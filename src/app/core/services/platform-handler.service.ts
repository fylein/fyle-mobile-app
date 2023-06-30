import { Injectable } from '@angular/core';
import { BackButtonActionPriority } from '../models/back-button-action-priority.enum';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlatformHandlerService {
  constructor(private platform: Platform) {}

  registerBackButtonAction(priority: BackButtonActionPriority, callback: () => void): Subscription {
    return this.platform.backButton.subscribeWithPriority(priority, callback);
  }
}
