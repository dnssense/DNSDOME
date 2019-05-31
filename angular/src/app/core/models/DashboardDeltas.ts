export interface DashboardDeltas {
    allowed_count:  number;
    allowed_rate: number;
    blocked_count: number;
    blocked_rate: number;
    hit_count:  number;
    hit_rate:  number;
    unique_destip:  number;
    unique_destip_rate:  number;
    unique_domain:  number;
    unique_domain_rate:  number;
    unique_srcip:  number;
    unique_subdomain:  number;
    unique_subdomain_rate: number;
}
