// Jasmine-based tests for package-lock.json/package-lock validation

import * as fs from 'fs';
import * as path from 'path';

describe('package-lock.json structure and integrity', () => {
  let lockFile: any;
  const lockFilePath = path.resolve(__dirname, '../package-lock.json');

  beforeAll(() => {
    const raw = fs.readFileSync(lockFilePath, 'utf-8');
    lockFile = JSON.parse(raw);
  });

  it('should exist and be a valid JSON object', () => {
    expect(lockFile).toBeDefined();
    expect(typeof lockFile).toBe('object');
    expect(lockFile).not.toBeNull();
  });

  it('should have required top-level keys', () => {
    expect(lockFile).toEqual(
      jasmine.objectContaining({
        name: jasmine.any(String),
        version: jasmine.any(String),
        lockfileVersion: jasmine.any(Number),
        requires: jasmine.any(Boolean),
        packages: jasmine.any(Object),
      })
    );
  });

  it('should have a valid lockfileVersion (>=1)', () => {
    expect(lockFile.lockfileVersion).toBeGreaterThanOrEqual(1);
  });

  it('should contain the root package in packages[""]', () => {
    expect(lockFile.packages).toBeDefined();
    expect(lockFile.packages['']).toBeDefined();
    expect(lockFile.packages[''].name).toBe(lockFile.name);
    expect(lockFile.packages[''].version).toBe(lockFile.version);
  });

  it('should list all dependencies in packages[""].dependencies', () => {
    const root = lockFile.packages[''];
    expect(root.dependencies).toBeDefined();
    expect(typeof root.dependencies).toBe('object');
    // Check a few critical dependencies
    ['@angular/core', '@ionic/angular', 'rxjs'].forEach(dep => {
      expect(root.dependencies[dep]).toBeDefined();
      expect(typeof root.dependencies[dep]).toBe('string');
    });
  });

  it('should list all devDependencies in packages[""].devDependencies', () => {
    const root = lockFile.packages[''];
    expect(root.devDependencies).toBeDefined();
    expect(typeof root.devDependencies).toBe('object');
    // Check a few critical devDependencies
    ['@angular/cli', 'typescript', 'karma'].forEach(dep => {
      expect(root.devDependencies[dep]).toBeDefined();
      expect(typeof root.devDependencies[dep]).toBe('string');
    });
  });

  it('should not have duplicate package entries', () => {
    const seen = new Set();
    for (const pkgName in lockFile.packages) {
      if (Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName)) {
        expect(seen.has(pkgName)).toBeFalse();
        seen.add(pkgName);
      }
    }
  });

  it('should have valid integrity and resolved fields for node_modules packages', () => {
    for (const pkgName in lockFile.packages) {
      if (
        Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName) &&
        pkgName.startsWith('node_modules/')
      ) {
        const pkg = lockFile.packages[pkgName];
        expect(pkg.version).toBeDefined();
        expect(pkg.resolved).toMatch(/^https?:\/\//);
        expect(pkg.integrity).toMatch(/^sha/);
      }
    }
  });

  it('should not contain any obvious merge conflict markers', () => {
    const raw = fs.readFileSync(lockFilePath, 'utf-8');
    expect(raw).not.toContain('<<<<<<<');
    expect(raw).not.toContain('=======');
    expect(raw).not.toContain('>>>>>>>');
  });

  it('should not have any empty dependency objects', () => {
    for (const pkgName in lockFile.packages) {
      if (Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName)) {
        const pkg = lockFile.packages[pkgName];
        if (pkg.dependencies) {
          expect(Object.keys(pkg.dependencies).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should have all required fields for each package entry', () => {
    for (const pkgName in lockFile.packages) {
      if (Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName)) {
        const pkg = lockFile.packages[pkgName];
        expect(pkg.version).toBeDefined();
        // dev field is optional, but if present should be boolean
        if ('dev' in pkg) {
          expect(typeof pkg.dev).toBe('boolean');
        }
        // license field is optional, but if present should be string
        if ('license' in pkg) {
          expect(typeof pkg.license).toBe('string');
        }
      }
    }
  });

  it('should not have any dependencies with empty version strings', () => {
    for (const pkgName in lockFile.packages) {
      if (Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName)) {
        const pkg = lockFile.packages[pkgName];
        if (pkg.dependencies) {
          for (const dep in pkg.dependencies) {
            if (Object.prototype.hasOwnProperty.call(pkg.dependencies, dep)) {
              expect(pkg.dependencies[dep]).not.toEqual('');
            }
          }
        }
      }
    }
  });

  it('should not have any circular dependencies in the root package', () => {
    const rootDeps = lockFile.packages[''].dependencies || {};
    expect(rootDeps[lockFile.name]).toBeUndefined();
  });

  it('should have consistent versions for critical dependencies', () => {
    // Example: All rxjs versions should match the root version
    const root = lockFile.packages[''];
    const rxjsVersion = root.dependencies.rxjs;
    for (const pkgName in lockFile.packages) {
      if (Object.prototype.hasOwnProperty.call(lockFile.packages, pkgName)) {
        const pkg = lockFile.packages[pkgName];
        if (pkg.dependencies && pkg.dependencies.rxjs) {
          expect(pkg.dependencies.rxjs).toBe(rxjsVersion);
        }
      }
    }
  });

  // Add more edge case tests as needed
});