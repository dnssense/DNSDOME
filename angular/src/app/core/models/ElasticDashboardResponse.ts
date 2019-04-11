export class ElasticDashboardResponse {
    companyId: number;
    date: Date;
    doc_count: number=0;
    unique_domain: number=0;
    unique_subdomain: number=0;
    unique_destip: number=0;
    unique_srcip: number=0;
    unique_user: number=0;
    unique_mac: number=0;
    domains: any;
    src_countries: any;
}