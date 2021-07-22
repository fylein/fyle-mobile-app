import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendBackAdvanceComponent } from './send-back-advance.component';

describe('SendBackAdvanceComponent', () => {
    let component: SendBackAdvanceComponent;
    let fixture: ComponentFixture<SendBackAdvanceComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ SendBackAdvanceComponent ],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SendBackAdvanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
