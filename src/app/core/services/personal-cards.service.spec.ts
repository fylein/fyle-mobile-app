import { TestBed } from '@angular/core/testing';

import { PersonalCardsService } from './personal-cards.service';

xdescribe('PersonalCardsService', () => {
  let service: PersonalCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
