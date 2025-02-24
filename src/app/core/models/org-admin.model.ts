import { Employee } from "./spender/employee.model";

export interface OrgAdmin {
  "count": number;
  "data": Partial<Employee>[];
  "limit": number;
  "offset": number;
  "url": string;
}
