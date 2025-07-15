import { File } from './file.model';
import { AdvanceRequestPlatform } from './platform/advance-request-platform.model';

export interface AdvanceRequestFile {
  files: File[];
  advanceReq: AdvanceRequestPlatform;
}
