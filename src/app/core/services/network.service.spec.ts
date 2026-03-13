import { TestBed } from '@angular/core/testing';
import { Network } from '@capacitor/network';
import { of } from 'rxjs';
import { ConnectionMessageStatus } from 'src/app/shared/components/fy-connection/connection-status.enum';
import { EventEmitter } from 'stream';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let networkService: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NetworkService],
    });
    networkService = TestBed.inject(NetworkService);
  });

  it('should be created', () => {
    expect(networkService).toBeTruthy();
  });

  it('isOnline(): should check if a device is online', (done) => {
    spyOn(Network, 'getStatus').and.callThrough();

    networkService.isOnline().subscribe((res) => {
      expect(res).toBeTrue();
      done();
    });
  });

  describe('getConnectionStatus():', () => {
    it('should get connection status', (done) => {
      networkService.isConnected$ = of(true);

      networkService.getConnectionStatus().subscribe((res) => {
        expect(res).toEqual(ConnectionMessageStatus.onlineMessageHidden);
        done();
      });
    });

    it('should get connection status when device is offline', (done) => {
      networkService.isConnected$ = of(false);

      networkService.getConnectionStatus().subscribe((res) => {
        expect(res).toEqual(ConnectionMessageStatus.disconnected);
        done();
      });
    });
  });
});
