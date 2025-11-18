import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';
import { FyApproverComponent } from './fy-approver.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('FyApproverComponent', () => {
  let component: FyApproverComponent;
  let fixture: ComponentFixture<FyApproverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ MatIconModule, MatIconTestingModule, TranslocoModule, FyApproverComponent],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyApproverComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyApprover.addApprover': 'Add approver',
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
  });

  it('openApproverListDialog(): should open approver list dialog', async () => {
    spyOn(component.notify, 'emit').and.callThrough();
    component.approverEmailsList = ['ajain@fyle.in'];
    component.id = 'rpFE5X1Pqi9P';
    component.type = 'report';
    component.ownerEmail = 'jay.b@fyle.in';
    fixture.detectChanges();
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const addApproversPopoverSpy = jasmine.createSpyObj('addApproversPopover', ['onWillDismiss', 'present']);
        addApproversPopoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: 'ajain@fyle.in',
            });
          }),
        );
        resolve(addApproversPopoverSpy);
      }),
    );

    await component.openApproverListDialog();
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: AddApproversPopoverComponent,
      componentProps: {
        approverEmailsList: component.approverEmailsList,
        id: component.id,
        type: component.type,
        ownerEmail: component.ownerEmail,
      },
      cssClass: 'fy-dialog-popover',
      backdropDismiss: false,
    });
    expect(component.notify.emit).toHaveBeenCalledOnceWith('ajain@fyle.in');
  });

  it('should show card if item type is other than TEAM_REPORT or ADVANCE_REQUEST', () => {
    spyOn(component, 'openApproverListDialog').and.resolveTo();
    component.type = 'REPORT';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.approver--card-action-text'))).toEqual('Add approver');
    const approverCardClickable = getElementBySelector(fixture, '.approver--card') as HTMLElement;

    click(approverCardClickable);
    expect(component.openApproverListDialog).toHaveBeenCalledTimes(1);
  });
});
