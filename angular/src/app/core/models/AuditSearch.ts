import { ColumnTagInput } from './ColumnTagInput';



export class AuditSearchRequest {
  dateInterval = 10080;
  startDate?: string;
  endDate?: string;
  topNumber = 10;
  must: ColumnTagInput[] = [];
  mustnot: ColumnTagInput[] = [];
  should: ColumnTagInput[] = [];

  duration = 0;
  page = 0;


}

export interface AuditData {
  companyId?: number;
  userId?: number;
  username: string;
  insertDate: string;
  message: string;
  isApiKey: number;
  ip: string;
  severity: string;
  detail: string;
  messageDetail?: string;
  popoverRows?: string[];
  popoverClass?: string;
}

export class AuditResponse {
  result: AuditData[] = [];
  total = 0;
}

