import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyMenuIconComponent } from './fy-menu-icon.component';
import { TrackingService } from 'src/app/core/services/tracking.service';

describe('FyMenuIconComponent', () => {
  let fyMenuIconComponent: FyMenuIconComponent;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let fixture: ComponentFixture<FyMenuIconComponent>;

  beforeEach(waitForAsync(() => {
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['menuButtonClicked']);
    TestBed.configureTestingModule({
      declarations: [FyMenuIconComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyMenuIconComponent);
    fyMenuIconComponent = fixture.componentInstance;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyMenuIconComponent).toBeTruthy();
  });

  it('menuButtonClicked(): should call trackingService.menuButtonClicked', () => {
    fyMenuIconComponent.menuButtonClicked();
    expect(trackingService.menuButtonClicked).toHaveBeenCalledTimes(1);
  });
});
