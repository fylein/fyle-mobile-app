import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'theme_mode';
  private readonly DEFAULT_THEME: ThemeMode = 'light';
  
  private currentTheme$ = new BehaviorSubject<ThemeMode>(this.DEFAULT_THEME);
  private isDarkMode$ = new BehaviorSubject<boolean>(false);

  constructor(private storageService: StorageService) {
    this.initializeTheme();
  }

  private async initializeTheme(): Promise<void> {
    const savedTheme = await this.storageService.get<ThemeMode>(this.THEME_STORAGE_KEY);
    const theme = savedTheme || this.DEFAULT_THEME;
    this.setTheme(theme);
  }

  getCurrentTheme(): Observable<ThemeMode> {
    return this.currentTheme$.asObservable();
  }

  getCurrentThemeValue(): ThemeMode {
    return this.currentTheme$.value;
  }

  isDarkMode(): Observable<boolean> {
    return this.isDarkMode$.asObservable();
  }

  isDarkModeValue(): boolean {
    return this.isDarkMode$.value;
  }

  async setTheme(theme: ThemeMode): Promise<void> {
    await this.storageService.set(this.THEME_STORAGE_KEY, theme);
    this.currentTheme$.next(theme);
    
    const isDark = this.calculateIsDarkMode(theme);
    this.isDarkMode$.next(isDark);
    
    // Apply theme to document
    this.applyThemeToDocument(isDark);
  }

  private calculateIsDarkMode(theme: ThemeMode): boolean {
    if (theme === 'dark') {
      return true;
    }
    if (theme === 'light') {
      return false;
    }
    // For 'auto' mode, check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyThemeToDocument(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark-mode');
      htmlElement.classList.remove('light-mode');
    } else {
      htmlElement.classList.add('light-mode');
      htmlElement.classList.remove('dark-mode');
    }
  }

  // Listen for system theme changes when in auto mode
  setupSystemThemeListener(): void {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme$.value === 'auto') {
          const isDark = e.matches;
          this.isDarkMode$.next(isDark);
          this.applyThemeToDocument(isDark);
        }
      });
    }
  }
} 