import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CccClassifiedActionsPage } from './ccc-classified-actions.page';

describe('CccClassifiedActionsPage', () => {
    let component: CccClassifiedActionsPage;
    let fixture: ComponentFixture<CccClassifiedActionsPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ CccClassifiedActionsPage ],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(CccClassifiedActionsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
