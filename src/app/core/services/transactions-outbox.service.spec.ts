import { TestBed } from '@angular/core/testing';

import { TransactionsOutboxService } from './transactions-outbox.service';

xdescribe('TransactionsOutboxService', () => {
  let service: TransactionsOutboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsOutboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
