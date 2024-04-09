import { TestBed } from '@angular/core/testing';

import { PlatformHandlerService } from './platform-handler.service';
import { Platform } from '@ionic/angular';
import { BackButtonActionPriority } from '../models/back-button-action-priority.enum';
import { noop } from 'rxjs';

describe('PlatformHandlerService', () => {
  let service: PlatformHandlerService;
  let platform: Platform;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Platform],
    });
    service = TestBed.inject(PlatformHandlerService);
    platform = TestBed.inject(Platform);

    spyOn(platform.backButton, 'subscribeWithPriority').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setBackButtonActionPriority(): should subscribe to back button with priority', () => {
    service.registerBackButtonAction(BackButtonActionPriority.ABSOLUTE, noop);
    expect(platform.backButton.subscribeWithPriority).toHaveBeenCalledOnceWith(BackButtonActionPriority.ABSOLUTE, noop);
  });
});
