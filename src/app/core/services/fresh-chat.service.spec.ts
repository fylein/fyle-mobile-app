import { TestBed } from '@angular/core/testing';

import { FreshChatService } from './fresh-chat.service';

describe('FreshChatService', () => {
    let service: FreshChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FreshChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
