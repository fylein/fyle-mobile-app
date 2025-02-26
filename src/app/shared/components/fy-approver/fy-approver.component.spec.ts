import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { AddApproversPopoverComponent } from './add-approvers-popover/add-approvers-popover.component';
import { FyApproverComponent } from './fy-approver.component';

describe('FyApproverComponent', () => {
  let component: FyApproverComponent;
  let fixture: ComponentFixture<FyApproverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    TestBed.configureTestingModule({
      declarations: [FyApproverComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyApproverComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
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
        const addApproversPopoverSpy = jasmine.createSpyObj('addApproversPopover', ['onWillDismiss', 'present']) as any;
        addApproversPopoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: 'ajain@fyle.in',
            });
          })
        );
        resolve(addApproversPopoverSpy);
      })
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
