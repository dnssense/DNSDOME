import { DashboardAverages } from './DashboardAverages';
import { DashboardDeltas } from './DashboardDeltas';
import { DashboardTimeRange } from './DashboardTimeRange';

export class ElasticDashboardResponse {
    companyId: number;
    date: Date;
    allowed_count: number;
    blocked_count: number;
    averages: DashboardAverages;
    delta: DashboardDeltas;
    firstly_seen_domains: any;
    total_hit: number;
    unique_destip: number;
    unique_domain: number;
    unique_mac: number;
    unique_srcip: number;
    unique_subdomain: number;
    unique_user: number;
    time_range: DashboardTimeRange;
}