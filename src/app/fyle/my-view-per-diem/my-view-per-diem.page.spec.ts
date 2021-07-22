import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewPerDiemPage } from './my-view-per-diem.page';

describe('MyViewPerDiemPage', () => {
    let component: MyViewPerDiemPage;
    let fixture: ComponentFixture<MyViewPerDiemPage>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ MyViewPerDiemPage ],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(MyViewPerDiemPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
