import { Injectable, inject } from '@angular/core';
import { BackButtonActionPriority } from '../models/back-button-action-priority.enum';
import { Platform } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlatformHandlerService {
  private platform = inject(Platform);

  registerBackButtonAction(priority: BackButtonActionPriority, callback: () => void): Subscription {
    return this.platform.backButton.subscribeWithPriority(priority, callback);
  }
}
