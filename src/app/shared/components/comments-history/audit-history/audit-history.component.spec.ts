import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { AuditHistoryComponent } from './audit-history.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { StatusesDiffComponent } from './statuses-diff/statuses-diff.component';
import { of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('AuditHistoryComponent', () => {
  let component: AuditHistoryComponent;
  let fixture: ComponentFixture<AuditHistoryComponent>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;

  beforeEach(waitForAsync(() => {
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    TestBed.configureTestingModule({
      declarations: [AuditHistoryComponent, StatusesDiffComponent, SnakeCaseToSpaceCase],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditHistoryComponent);
    component = fixture.componentInstance;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));
    component.estatuses = estatusData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display estatuses correctly', () => {
    const eStatusCards = getAllElementsBySelector(fixture, '.audit-history--block');
    expect(eStatusCards.length).toEqual(estatusData1.length);
    expect(getTextContent(getElementBySelector(fixture, '.audit-history--category'))).toEqual(
      estatusData1[0].st.category
    );
    expect(getTextContent(getElementBySelector(fixture, '.audit-history--timestamp'))).toEqual('Sep 23, 2022 9:03 PM');
    expect(getTextContent(getElementBySelector(fixture, '.comment-text'))).toEqual(estatusData1[0].st_comment);
  });
});
