export class DashboardStats {
    totalHitCountForDashboard = 0;
    totalHitCountForDashboardDelta = 0;
    totalBlockCountForDashboard = 0;
    totalAllowedCountForDashboard = 0;
    totalBlockCountForDashboardDelta = 0;
    totalUniqueDomain = 0;
    totalUniqueDomainDelta = 0;
    totalUniqueBlockedDomainForDashboard = 0;
    totalUniqueBlockedDomainForDashboardDelta = 0;
    securityRiskCountForDashboard = 0;
    securityRiskCountForDashboardDelta = 0;
    uSecurityRiskCountForDashboard = 0;
    uSecurityRiskCountForDashboardDelta = 0;
    grayCountForDashboard = 0;
    grayCountForDashboardDelta = 0;
    uGrayCountForDashboard = 0;
    uGrayCountForDashboardDelta = 0;
    riskScore = 0;
    hitAverages: number[] = [];
    totalHits: number[] = [];
    totalBlocks: number[] = [];
    blockAverages: number[] = [];
    uniqueDomain: number[] = [];
    uniqueBlockedDomain: number[] = [];
    uniqueDomainAvg: number[] = [];
    uniqueSubdomain: number[] = [];
    uniqueSubdomainAvg: number[] = [];
    uniqueDesIp: number[] = [];
    uniqueDesIpAvg: number[] = [];

    /**
     *
     */
    constructor() {
        this.totalBlocks = [];
        this.hitAverages = [];
        this.totalHits = [];
        this.blockAverages = [];
        this.uniqueDomain = [];
        this.uniqueDomainAvg = [];
        this.uniqueSubdomain = [];
        this.uniqueSubdomainAvg = [];
        this.uniqueDesIp = [];
        this.uniqueDesIpAvg = [];
        this.uniqueBlockedDomain = [];

    }
}
