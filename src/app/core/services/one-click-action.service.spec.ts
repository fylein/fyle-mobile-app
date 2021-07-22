import { TestBed } from '@angular/core/testing';

import { OneClickActionService } from './one-click-action.service';

describe('OneClickActionService', () => {
    let service: OneClickActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OneClickActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
