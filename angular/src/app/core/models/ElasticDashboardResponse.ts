import { DashboardAverages } from './DashboardAverages';
import { DashboardDeltas } from './DashboardDeltas';
import { DashboardTimeRange } from './DashboardTimeRange';

export class ElasticDashboardResponse {
    companyId: number;
    date: Date;
    allowed_count: number;
    blocked_count: number;
    category_hits: any;
    averages: DashboardAverages;
    delta: DashboardDeltas;
    firstly_seen_domains: DomainItem[];
    total_hit: number;
    unique_destip: number;
    unique_domain: number;
    unique_blocked_domain:number;
    unique_mac: number;
    unique_srcip: number;
    unique_subdomain: number;
    unique_user: number;
    time_range: DashboardTimeRange;
    hourIndex: number;
}

export interface DomainItem {
    hits: number
    domain: string
    category: string[]
    unique_subdomain: number
}
