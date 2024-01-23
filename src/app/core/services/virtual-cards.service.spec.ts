import { TestBed } from '@angular/core/testing';

import { VirtualCardsService } from './virtual-cards.service';

describe('VirtualCardsService', () => {
  let service: VirtualCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
