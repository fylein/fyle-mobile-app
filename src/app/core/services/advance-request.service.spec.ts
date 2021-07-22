import { TestBed } from '@angular/core/testing';

import { AdvanceRequestService } from './advance-request.service';

describe('AdvanceRequestService', () => {
    let service: AdvanceRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AdvanceRequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
