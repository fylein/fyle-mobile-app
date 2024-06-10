import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdvanceWalletsService } from './advance-wallets.service';
import { SpenderService } from './spender.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  advanceWalletPaginated1,
  advanceWalletPaginated2,
  expectedAdvanceWalletPaginated,
  advanceWalletCountQueryParam,
  advanceWalletQueryParam,
  advanceWalletsResponse,
} from 'src/app/core/mock-data/platform/v1/advance-wallet.data';

describe('AdvanceWalletsService', () => {
  let advanceWalletsService: AdvanceWalletsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        { provide: PAGINATION_SIZE, useValue: 2 },
        { provide: SpenderService, useValue: spenderServiceSpy },
      ],
    });
    advanceWalletsService = TestBed.inject(AdvanceWalletsService);
    spenderPlatformV1ApiService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(advanceWalletsService).toBeTruthy();
  });

  it('getAllAdvanceWallets(): should get all advance wallets', (done) => {
    const getAdvanceWallets = spyOn(advanceWalletsService, 'getAdvanceWallets');
    spyOn(advanceWalletsService, 'getAdvanceWalletsCount').and.returnValue(of(4));
    getAdvanceWallets
      .withArgs({ offset: 0, limit: 2, order: 'created_at.desc,id.desc' })
      .and.returnValue(of(advanceWalletPaginated1));
    getAdvanceWallets
      .withArgs({ offset: 2, limit: 2, order: 'created_at.desc,id.desc' })
      .and.returnValue(of(advanceWalletPaginated2));

    advanceWalletsService.getAllAdvanceWallets().subscribe((res) => {
      expect(res).toEqual(expectedAdvanceWalletPaginated);
      expect(advanceWalletsService.getAdvanceWalletsCount).toHaveBeenCalledTimes(1);
      expect(getAdvanceWallets).toHaveBeenCalledWith({ offset: 0, limit: 2, order: 'created_at.desc,id.desc' });
      expect(getAdvanceWallets).toHaveBeenCalledWith({ offset: 2, limit: 2, order: 'created_at.desc,id.desc' });
      expect(getAdvanceWallets).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('getAdvanceWalletsCount(): should return the count of advance wallets', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(advanceWalletsResponse));

    advanceWalletsService.getAdvanceWalletsCount(advanceWalletCountQueryParam).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(advanceWalletsResponse.count);

      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/advance_wallets', {
        params: advanceWalletCountQueryParam,
      });
      done();
    });
  });

  it('getAdvanceWallets(): should return the advance wallets', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(advanceWalletsResponse));

    advanceWalletsService.getAdvanceWallets(advanceWalletQueryParam).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(advanceWalletsResponse.data);

      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/advance_wallets', {
        params: advanceWalletQueryParam,
      });
      done();
    });
  });
});
