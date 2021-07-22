import { TestBed } from '@angular/core/testing';

import { PerDiemService } from './per-diem.service';

describe('PerDiemService', () => {
    let service: PerDiemService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PerDiemService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
