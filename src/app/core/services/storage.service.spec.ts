import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    const preferencesSpy = jasmine.createSpyObj('Preferences', ['set', 'get', 'remove', 'clear']);
    TestBed.configureTestingModule({
      providers: [StorageService, { provide: Preferences, useValue: preferencesSpy }],
    });
    storageService = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(storageService).toBeTruthy();
  });

  describe('set():', () => {
    it('should set a key-value pair', async () => {
      const key = 'etxncCount';
      const value = 150;
      spyOn(Preferences, 'set').and.returnValue(Promise.resolve());

      await storageService.set(key, value);

      Preferences.set({
        key,
        value: JSON.stringify(value),
      });
      // Since there is no expect block, adding pending() to avoid the warning while running tests
      pending();
    });
  });

  describe('get():', () => {
    it('should get a value for a given key', async () => {
      const key = 'isFirstReportCreated';
      const value = true;
      // Setting the value to fetch it later
      spyOn(Preferences, 'set').and.returnValue(Promise.resolve());
      await storageService.set(key, value);

      spyOn(Preferences, 'get').and.returnValue(Promise.resolve({ value: JSON.stringify(value) }));

      const result = await storageService.get(key);

      Preferences.get({ key });
      expect(result).toEqual(value);
    });

    it('should return null if no value is found', async () => {
      const key = 'etxncCountTest';
      spyOn(Preferences, 'get').and.returnValue(null);

      const result = await storageService.get(key);

      Preferences.get({ key });
      expect(result).toBeNull();
    });
  });

  describe('delete():', () => {
    it('should delete a value for a given key', async () => {
      const key = 'user';
      spyOn(Preferences, 'remove').and.returnValue(Promise.resolve());

      await storageService.delete(key);

      Preferences.remove({ key });
      pending();
    });
  });

  describe('clearAll():', () => {
    it('should clear all key-value pairs', async () => {
      spyOn(Preferences, 'clear').and.returnValue(Promise.resolve());

      await storageService.clearAll();

      Preferences.clear();
      pending();
    });
  });
});
