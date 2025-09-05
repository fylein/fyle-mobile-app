import fs from 'fs';
import path from 'path';

export interface TestFiles {
  validJpg: string;
  validPng: string;
  validPdf: string;
  invalidFileType: string;
  zeroByteFile: string;
  oversizedFile: string;
}

export class UploadFilesService {
  private testDir: string;

  public testFiles: TestFiles;

  constructor(baseDir: string, dirName: string = 'test-files') {
    this.testDir = path.join(baseDir, dirName);
    this.testFiles = {
      validJpg: 'valid-file.jpg',
      validPng: 'valid-file.png',
      validPdf: 'valid-file.pdf',
      invalidFileType: 'invalid-file.txt',
      zeroByteFile: 'zero-byte-file.jpg',
      oversizedFile: 'oversized-file.jpg',
    };
  }

  async createTestFiles(): Promise<void> {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }

    fs.writeFileSync(path.join(this.testDir, this.testFiles.validJpg), Buffer.alloc(1024)); // 1KB
    fs.writeFileSync(path.join(this.testDir, this.testFiles.validPng), Buffer.alloc(1024)); // 1KB
    fs.writeFileSync(path.join(this.testDir, this.testFiles.validPdf), Buffer.alloc(1024)); // 1KB

    fs.writeFileSync(path.join(this.testDir, this.testFiles.invalidFileType), 'Invalid file content');
    fs.writeFileSync(path.join(this.testDir, this.testFiles.zeroByteFile), ''); // 0 bytes
    fs.writeFileSync(path.join(this.testDir, this.testFiles.oversizedFile), Buffer.alloc(12 * 1024 * 1024)); // 12MB (likely over limit)

    for (let i = 0; i < 22; i++) {
      fs.writeFileSync(path.join(this.testDir, `valid-file-${i}.jpg`), Buffer.alloc(1024)); // 1KB each
    }
  }

  getFilePath(fileName: string): string {
    return path.join(this.testDir, fileName);
  }

  getMultipleFilePaths(count: number, pattern: string = 'valid-file-', extension: string = '.jpg'): string[] {
    return Array.from({ length: count }, (_, i) => this.getFilePath(`${pattern}${i}${extension}`));
  }

  cleanup(): void {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
  }
}
