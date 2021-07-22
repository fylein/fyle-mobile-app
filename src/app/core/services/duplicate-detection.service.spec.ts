import { TestBed } from '@angular/core/testing';

import { DuplicateDetectionService } from './duplicate-detection.service';

describe('DuplicateDetectionService', () => {
    let service: DuplicateDetectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DuplicateDetectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
