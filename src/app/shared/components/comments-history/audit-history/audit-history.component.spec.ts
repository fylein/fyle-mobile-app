import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { AuditHistoryComponent } from './audit-history.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { StatusesDiffComponent } from './statuses-diff/statuses-diff.component';
import { BehaviorSubject, of } from 'rxjs';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import {
  eStatusWithProjectName,
  eStatusWithProjectName2,
  eStatusWithReimbursible,
  estatusSample,
} from 'src/app/core/test-data/status.service.spec.data';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { DateWithTimezonePipe } from 'src/app/shared/pipes/date-with-timezone.pipe';
import { TIMEZONE } from 'src/app/constants';

describe('AuditHistoryComponent', () => {
  let component: AuditHistoryComponent;
  let fixture: ComponentFixture<AuditHistoryComponent>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        TranslocoModule,
        AuditHistoryComponent,
        StatusesDiffComponent,
        SnakeCaseToSpaceCase,
        DateWithTimezonePipe,
      ],
      providers: [
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
        { provide: TIMEZONE, useValue: new BehaviorSubject<string>('UTC') },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditHistoryComponent);
    component = fixture.componentInstance;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));
    const mockEstatuses = cloneDeep(estatusSample).map((estatus) => ({
      ...estatus,
      st_created_at: new Date(estatus.st_created_at),
    }));
    component.estatuses = mockEstatuses;
    spyOn(component, 'hasDetails').and.callThrough();
    spyOn(component, 'getAndUpdateProjectName').and.callThrough();
    spyOn(component, 'setReimbursable').and.callThrough();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'auditHistory.detailsLabel': 'Details:',
        'auditHistory.cardTransactionDetailsLabel': 'Card transaction details: ',
        'auditHistory.mergedExpenseDetailsLabel': 'Details of the merged expense: ',
        'auditHistory.defaultProjectFieldName': 'project',
        'auditHistory.projectNameCollision': 'project name ({{projectFieldName}})',
        'auditHistory.reimbursableNo': 'No',
        'auditHistory.reimbursableYes': 'Yes',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
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
    expect(getTextContent(getElementBySelector(fixture, '.comment-text'))).toEqual(estatusSample[0].st_comment);
  });

  it('should show details if any statement diff exists', () => {
    const detailsContent = getAllElementsBySelector(fixture, 'app-statuses-diff');
    expect(detailsContent.length).toEqual(13);
  });

  it('updateProjectNameKey(): should update project name', () => {
    component.estatuses = cloneDeep(eStatusWithProjectName);
    fixture.detectChanges();

    component.updateProjectNameKey();

    expect(component.estatuses[0].st_diff).toEqual({ Purpose: 'Project' });
  });

  it('updateProjectNameKey(): should update project name if it already exists', () => {
    component.estatuses = cloneDeep(eStatusWithProjectName2);
    fixture.detectChanges();

    component.updateProjectNameKey();

    expect(component.projectFieldName).toEqual('project name (Purpose)');
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

  it('setReimbursable(): should set re-imbursable', () => {
    component.estatuses = cloneDeep(eStatusWithReimbursible).map((estatus) => ({
      ...estatus,
      st_created_at: new Date(estatus.st_created_at),
    }));
    fixture.detectChanges();

    component.setReimbursable();
    expect(component.estatuses[0].st_diff['non-reimbursable']).toBeUndefined();
    expect(component.estatuses[0].st_diff.reimbursable).toEqual('No');
  });
});
