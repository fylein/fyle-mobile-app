import { TestBed } from '@angular/core/testing';

import { GmapsService } from './gmaps.service';

xdescribe('GmapsService', () => {
  let service: GmapsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GmapsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
