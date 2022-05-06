import { TestBed } from '@angular/core/testing';

import { MobileEventService } from './mobile-event.service';

xdescribe('MobileEventService', () => {
  let service: MobileEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
