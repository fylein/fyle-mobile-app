import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ConnectionMessageStatus } from './connection-status.enum';
import { NetworkService } from '../../../core/services/network.service';
import { FyConnectionComponent } from './fy-connection.component';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('FyConnectionComponent', () => {
  let fyConnectionComponent: FyConnectionComponent;
  let fixture: ComponentFixture<FyConnectionComponent>;
  let networkServiceSpy: jasmine.SpyObj<NetworkService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    networkServiceSpy = jasmine.createSpyObj('NetworkService', [
      'isOnline',
      'connectivityWatcher',
      'getConnectionStatus',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, FyConnectionComponent],
      providers: [
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyConnectionComponent);
    fyConnectionComponent = fixture.componentInstance;
    networkServiceSpy.isOnline.and.returnValue(of(true));
    networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.onlineMessageShown));
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyConnection.disconnectedMessage': 'No internet connection',
        'fyConnection.reconnectedMessage': 'Back online',
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
    it('should display offline message when not connected', fakeAsync(() => {
      networkServiceSpy.getConnectionStatus.and.returnValue(of(ConnectionMessageStatus.disconnected));
      fyConnectionComponent.ngOnInit();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const connMsg = getElementBySelector(fixture, '.connection--offline');
      expect(getTextContent(connMsg)).toEqual('No internet connection');
    }));

    it('should return correct ConnectionMessageStatus', () => {
      expect(fyConnectionComponent.ConnectionMessageStatus).toEqual(ConnectionMessageStatus);
    });
  });
});
