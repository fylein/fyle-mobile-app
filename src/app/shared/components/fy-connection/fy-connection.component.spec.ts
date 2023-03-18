import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ConnectionMessageStatus } from './connection-status.enum';
import { NetworkService } from '../../../core/services/network.service';
import { FyConnectionComponent } from './fy-connection.component';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';

describe('FyConnectionComponent', () => {
  let fyConnectionComponent: FyConnectionComponent;
  let fixture: ComponentFixture<FyConnectionComponent>;
  let networkServiceSpy: jasmine.SpyObj<NetworkService>;

  beforeEach(waitForAsync(() => {
    networkServiceSpy = jasmine.createSpyObj('NetworkService', [
      'isOnline',
      'connectivityWatcher',
      'getConnectionStatus',
    ]);
    TestBed.configureTestingModule({
      declarations: [FyConnectionComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: NetworkService, useValue: networkServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FyConnectionComponent);
    fyConnectionComponent = fixture.componentInstance;
    networkServiceSpy.isOnline.and.returnValue(of(true));
    networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.onlineMessageShown));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyConnectionComponent).toBeTruthy();
  });

  describe('setupNetworkWatcher():', () => {
    it('should set up network watcher', () => {
      expect(networkServiceSpy.connectivityWatcher).toHaveBeenCalled();
    });

    it('should update the connection status when network status changes', () => {
      networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.onlineMessageShown));
      fyConnectionComponent.ngOnInit();
      fixture.detectChanges();
      const connStatus = getElementBySelector(fixture, '.connection--online-message');
      expect(connStatus).toBeTruthy();
    });

    it('should display online message when connected', () => {
      networkServiceSpy.isOnline.and.returnValue(of(true));
      networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.onlineMessageShown));
      fyConnectionComponent.ngOnInit();
      fixture.detectChanges();
      const connMsg = getElementBySelector(fixture, '.connection--online-message');
      expect(getTextContent(connMsg)).toEqual('Back online');
    });
  });

  describe('getConnectionStatus():', () => {
    it('should display offline message when not connected', () => {
      networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.disconnected));
      fyConnectionComponent.ngOnInit();
      fixture.detectChanges();
      const connMsg = getElementBySelector(fixture, '.connection--offline');
      expect(getTextContent(connMsg)).toEqual('No internet connection');
    });

    it('should return correct ConnectionMessageStatus', () => {
      expect(fyConnectionComponent.ConnectionMessageStatus).toEqual(ConnectionMessageStatus);
    });
  });
});
