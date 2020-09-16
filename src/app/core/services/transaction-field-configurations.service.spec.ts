import { TestBed } from '@angular/core/testing';

import { TransactionFieldConfigurationsService } from './transaction-field-configurations.service';

describe('TransactionFieldConfigurationsService', () => {
  let service: TransactionFieldConfigurationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionFieldConfigurationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
