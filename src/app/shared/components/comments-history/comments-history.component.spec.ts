import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CommentsHistoryComponent } from './comments-history.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { of } from 'rxjs';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';

fdescribe('CommentsHistoryComponent', () => {
  let component: CommentsHistoryComponent;
  let fixture: ComponentFixture<CommentsHistoryComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    modalController = jasmine.createSpyObj('ModalController', ['create']);
    modalPropertiesService = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    statusService = jasmine.createSpyObj('StatusService', ['find']);
    statusService.find.and.returnValue(of(getEstatusApiResponse));
    trackingService = jasmine.createSpyObj('TrackingService', ['addComment', 'viewComment']);

    TestBed.configureTestingModule({
      declarations: [CommentsHistoryComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        { provide: ModalController, useValue: modalController },
        { provide: ModalPropertiesService, useValue: modalPropertiesService },
        { provide: StatusService, useValue: statusService },
        { provide: TrackingService, useValue: trackingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsHistoryComponent);
    component = fixture.componentInstance;
    component.objectType = 'transactions';
    component.objectId = 'tx1oTNwgRdRq';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit():', () => {
    it('should set number of comments correctly when there are comments and refresh the comments', () => {
      const mockComments = getEstatusApiResponse;
      statusService.find.and.returnValue(of(mockComments));
      component.ngOnInit();
      fixture.detectChanges();
      component.refreshComments$.next(null);
      fixture.detectChanges();
      component.noOfComments$.subscribe((count) => {
        expect(count).toEqual(3);
        expect(statusService.find).toHaveBeenCalledWith(component.objectType, component.objectId);
      });
    });

    it('should set noOfComments$ correctly when there are no comments', () => {
      const mockComments = [];
      statusService.find.and.returnValue(of(mockComments));
      component.ngOnInit();
      component.noOfComments$.subscribe((count) => {
        expect(count).toBe(0);
      });
    });
  });
});
