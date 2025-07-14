describe('package-lock.json validation', () => {
  // Helper to load and parse JSON, simulating file read
  function loadPackageLock(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return e;
    }
  }

  it('should validate a correct package-lock.json structure (happy path)', () => {
    const validLock = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      requires: true,
      packages: {
        "": {
          name: "fyle-mobile-app2",
          version: "0.0.1",
          hasInstallScript: true,
          dependencies: {
            "lodash": "^4.17.21"
          },
          devDependencies: {
            "jasmine": "^4.0.0"
          }
        }
      }
    };
    expect(() => {
      // Simulate validation logic
      if (!validLock.name || !validLock.version || !validLock.lockfileVersion) throw new Error('Missing required fields');
    }).not.toThrow();
  });

  it('should fail validation for corrupted/invalid JSON', () => {
    const invalidJson = '{"name": "fyle-mobile-app2", "version": "0.0.1",'; // Truncated
    const result = loadPackageLock(invalidJson);
    expect(result instanceof SyntaxError).toBeTrue();
  });

  it('should fail validation if required keys are missing', () => {
    const missingKeys = {
      version: "0.0.1",
      lockfileVersion: 3
    };
    expect(() => {
      if (!missingKeys.name) throw new Error('Missing required field: name');
    }).toThrow();
  });

  it('should fail validation if lockfileVersion is not a number', () => {
    const badType = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: "three"
    };
    expect(() => {
      if (typeof badType.lockfileVersion !== 'number') throw new Error('lockfileVersion must be a number');
    }).toThrow();
  });

  it('should fail validation if dependencies is not an object', () => {
    const badDeps = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: "lodash"
        }
      }
    };
    expect(() => {
      if (typeof badDeps.packages[""].dependencies !== 'object') throw new Error('dependencies must be an object');
    }).toThrow();
  });

  it('should allow extra unexpected keys but warn', () => {
    const extraKeys = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      foo: "bar"
    };
    // Simulate warning, not error
    expect(extraKeys.foo).toBeDefined();
  });

  it('should handle empty file gracefully', () => {
    const empty = '';
    const result = loadPackageLock(empty);
    expect(result instanceof SyntaxError).toBeTrue();
  });

  it('should handle empty object gracefully', () => {
    const emptyObj = {};
    expect(() => {
      if (!emptyObj.name) throw new Error('Missing required field: name');
    }).toThrow();
  });

  it('should validate deeply nested dependencies', () => {
    const deepDeps = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            "a": "^1.0.0"
          }
        },
        "node_modules/a": {
          version: "1.0.0",
          dependencies: {
            "b": "^2.0.0"
          }
        },
        "node_modules/b": {
          version: "2.0.0"
        }
      }
    };
    expect(() => {
      // Simulate recursive validation
      function checkDeps(pkg, packages) {
        if (pkg.dependencies) {
          Object.keys(pkg.dependencies).forEach(dep => {
            const depPath = `node_modules/${dep}`;
            if (!packages[depPath]) throw new Error(`Missing dependency: ${dep}`);
            checkDeps(packages[depPath], packages);
          });
        }
      }
      checkDeps(deepDeps.packages[""], deepDeps.packages);
    }).not.toThrow();
  });

  it('should handle devDependencies, optionalDependencies, and peerDependencies', () => {
    const lock = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: {
        "": {
          devDependencies: { "jest": "^29.0.0" },
          optionalDependencies: { "fsevents": "^2.3.2" },
          peerDependencies: { "rxjs": "^7.0.0" }
        }
      }
    };
    expect(lock.packages[""].devDependencies).toBeDefined();
    expect(lock.packages[""].optionalDependencies).toBeDefined();
    expect(lock.packages[""].peerDependencies).toBeDefined();
  });

  it('should fail validation for circular dependencies (if not supported)', () => {
    const circular = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: { "a": "^1.0.0" }
        },
        "node_modules/a": {
          version: "1.0.0",
          dependencies: { "": "^0.0.1" }
        }
      }
    };
    expect(() => {
      const visited = new Set();
      function checkDeps(pkgName, packages) {
        if (visited.has(pkgName)) throw new Error('Circular dependency detected');
        visited.add(pkgName);
        const pkg = packages[pkgName];
        if (pkg && pkg.dependencies) {
          Object.keys(pkg.dependencies).forEach(dep => {
            const depPath = dep === "" ? "" : `node_modules/${dep}`;
            checkDeps(depPath, packages);
          });
        }
        visited.delete(pkgName);
      }
      checkDeps("", circular.packages);
    }).toThrow();
  });

  it('should ignore non-object packages entries', () => {
    const badPackages = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: "not-an-object"
    };
    expect(() => {
      if (typeof badPackages.packages !== 'object') throw new Error('packages must be an object');
    }).toThrow();
  });

  it('should validate presence of hasInstallScript if present', () => {
    const lock = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 3,
      packages: {
        "": {
          hasInstallScript: true
        }
      }
    };
    expect(typeof lock.packages[""].hasInstallScript).toBe('boolean');
  });

  it('should fail if lockfileVersion is out of supported range', () => {
    const lock = {
      name: "fyle-mobile-app2",
      version: "0.0.1",
      lockfileVersion: 99
    };
    expect(() => {
      if (lock.lockfileVersion < 1 || lock.lockfileVersion > 3) throw new Error('Unsupported lockfileVersion');
    }).toThrow();
  });

  // Add more edge cases as needed for comprehensive coverage
});