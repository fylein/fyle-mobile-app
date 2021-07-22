import { TestBed } from '@angular/core/testing';

import { TransportationRequestsService } from './transportation-requests.service';

describe('TransportationRequestsService', () => {
    let service: TransportationRequestsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TransportationRequestsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
