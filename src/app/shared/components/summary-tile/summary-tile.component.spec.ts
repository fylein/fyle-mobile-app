import { SimpleChange } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AdvanceRequestApprover } from 'src/app/core/mock-data/advance-request-approver.data';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from '../../pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { FySummaryTileComponent } from './summary-tile.component';
import { of } from 'rxjs';

describe('FySummaryTileComponent', () => {
  let component: FySummaryTileComponent;
  let fixture: ComponentFixture<FySummaryTileComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(async () => {
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    await TestBed.configureTestingModule({
      declarations: [
        FySummaryTileComponent,
        HumanizeCurrencyPipe,
        ExactCurrencyPipe,
        FyCurrencyPipe,
        SnakeCaseToSpaceCase,
        EllipsisPipe,
      ],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: FyCurrencyPipe,
          useValue: fyCurrencyPipeSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FySummaryTileComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'summaryTile.pending': 'Pending',
        'summaryTile.approvers': 'Approvers',
        'summaryTile.projectLabel': 'Project',
        'summaryTile.approved': 'Approved',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render category if input is present', () => {
    component.category = 'Travel';
    fixture.detectChanges();
    const categoryEl = fixture.nativeElement.querySelector('.summary-tile--card-container__category');
    expect(categoryEl).toBeTruthy();
    expect(categoryEl.textContent).toContain('Travel');
  });

  it('should render purpose if input is present', () => {
    component.purpose = 'Conference';
    fixture.detectChanges();
    const purposeEl = fixture.nativeElement.querySelector('.summary-tile--card-container__purpose');
    expect(purposeEl).toBeTruthy();
    expect(purposeEl.textContent).toContain('Conference');
  });

  it('should render merchant if input is present', () => {
    component.merchant = 'Amazon';
    fixture.detectChanges();
    const merchantEl = fixture.nativeElement.querySelector('.summary-tile--card-container__merchant');
    expect(merchantEl).toBeTruthy();
    expect(merchantEl.textContent).toContain('Amazon');
  });

  it('should render project if input is present', () => {
    component.project = 'Project X';
    fixture.detectChanges();
    const projectEl = fixture.nativeElement.querySelector('.summary-tile--card-container__project');
    expect(projectEl).toBeTruthy();
    expect(projectEl.textContent).toContain('Project X');
  });

  it('should render currency and amount if inputs are present', () => {
    component.currency = 'USD';
    component.amount = 699;
    fixture.detectChanges();
    const currencyEl = fixture.nativeElement.querySelector('.summary-tile--card-container__amount');
    expect(currencyEl).toBeTruthy();
  });

  it('should render status if input is present', () => {
    component.status = 'APPROVAL_PENDING';
    fixture.detectChanges();
    const statusEl = fixture.nativeElement.querySelector('.summary-tile--card-container__state-pill');
    expect(statusEl).toBeTruthy();
    expect(statusEl.textContent).toContain('Pending');
  });

  it('should render approvers if input is present', () => {
    component.approvals = AdvanceRequestApprover;
    fixture.detectChanges();
    const approverEls = fixture.nativeElement.querySelectorAll('.summary-tile--approvers-list');
    expect(approverEls.length).toBe(1);
    expect(approverEls[0].textContent).toContain('DimpleApproval pending');
  });

  it('should update the status to "Pending" when the status is "APPROVAL PENDING"', () => {
    const changes = {
      status: new SimpleChange('APPROVAL PENDING', 'DRAFT', false),
    };
    component.status = 'APPROVAL PENDING';
    fixture.detectChanges();
    component.ngOnChanges(changes);

    expect(component.status).toBe('Pending');
  });

  it('should update the status to "Approved" when the status is "Approved"', () => {
    const changes = {
      status: new SimpleChange('Approved', 'Pending', false),
    };
    component.status = 'Approved';
    fixture.detectChanges();
    component.ngOnChanges(changes);

    expect(component.status).toBe('Approved');
  });
});
