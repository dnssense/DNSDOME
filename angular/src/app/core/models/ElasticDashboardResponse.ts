export class ElasticDashboardResponse {
    companyId: number;
    date: Date;
    doc_count: number;
    unique_domain: number;
    unique_subdomain: number;
    unique_destip: number;
    unique_srcip: number;
    unique_user: number;
    unique_mac: number;
    domains: any;
    src_countries: any;
}