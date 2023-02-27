import { AdvanceRequests } from './advance-requests.model';
import { File } from './file.model';
export interface AdvanceRequestFile {
  files: File[];
  advanceReq: AdvanceRequests;
}
