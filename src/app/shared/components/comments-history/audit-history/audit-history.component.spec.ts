import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { AuditHistoryComponent } from './audit-history.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { StatusesDiffComponent } from './statuses-diff/statuses-diff.component';
import { of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { eStatusWithProjectName, estatusSample } from 'src/app/core/test-data/status.service.spec.data';
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
    component.estatuses = estatusSample;
    spyOn(component, 'hasDetails').and.callThrough();
    spyOn(component, 'getAndUpdateProjectName').and.callThrough();
    spyOn(component, 'setReimbursable').and.callThrough();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.hasDetails).toHaveBeenCalledTimes(1);
    expect(component.setReimbursable).toHaveBeenCalledTimes(1);
    expect(component.getAndUpdateProjectName).toHaveBeenCalledTimes(1);
  });

  it('should display estatuses correctly', () => {
    const eStatusCards = getAllElementsBySelector(fixture, '.audit-history--block');
    expect(eStatusCards.length).toEqual(estatusSample.length);
    expect(getTextContent(getElementBySelector(fixture, '.audit-history--category'))).toEqual(
      estatusSample[0].st.category
    );
    expect(getTextContent(getElementBySelector(fixture, '.audit-history--timestamp'))).toEqual('Nov 7, 2022 4:26 PM');
    expect(getTextContent(getElementBySelector(fixture, '.comment-text'))).toEqual(estatusSample[0].st_comment);
  });

  it('should show details if any statement diff exists', () => {
    const detailsContent = getAllElementsBySelector(fixture, 'app-statuses-diff');
    expect(detailsContent.length).toEqual(13);
  });

  it('updateProjectNameKey(): should update project name', () => {
    component.estatuses = eStatusWithProjectName;
    fixture.detectChanges();

    component.updateProjectNameKey();
    expect(component.estatuses[0].st_diff).toEqual({ Purpose: 'Project' });
  });

  it('getAndUpdateProjectName(): should get and update project name', (done) => {
    spyOn(component, 'updateProjectNameKey');
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));
    fixture.detectChanges();

    component.getAndUpdateProjectName();

    expect(component.projectFieldName).toEqual(transformedResponse2[0].field_name);
    expect(component.updateProjectNameKey).toHaveBeenCalledTimes(1);
    done();
  });
});
