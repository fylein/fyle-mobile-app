import { TestBed } from '@angular/core/testing';

import { RouterAuthService } from './router-auth.service';

describe('RouterAuthService', () => {
    let service: RouterAuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RouterAuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
