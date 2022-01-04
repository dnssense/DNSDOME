export class Company {
    public id: number = -1;
    public name: string;
    public logo: any;
    public blockMessage: string;
    public url: string;
    public etvUser: boolean;
    public industry: string;
    public personnelCount: string;
}

export class CompanyUpdaterDTO {
  id: number
  parentRoleLevel?: string
  parentIsLocked?: number
  parentId?: number
  companyType?: COMPANY_TYPE
  audit?: {
    userId: number;
    username: string;
    ip: string;
  }
}

export type COMPANY_TYPE = "ROKSIT" | "EONSCOPE" | "DNSSENSE" | "DNSCYTE" | "INVESTIGATE" | "CMERP" | "ROOT" | "DISTRIBUTOR" | "MSP"
