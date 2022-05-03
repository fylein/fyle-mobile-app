import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog.component';

xdescribe('AddTxnToReportDialogComponent', () => {
  let component: AddTxnToReportDialogComponent;
  let fixture: ComponentFixture<AddTxnToReportDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AddTxnToReportDialogComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(AddTxnToReportDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
