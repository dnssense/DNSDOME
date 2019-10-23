export class DashboardStats {
    totalHitCountForDashboard: number = 0;
    totalHitCountForDashboardDelta: number = 0;
    totalBlockCountForDashboard: number = 0;
    totalBlockCountForDashboardDelta: number = 0;
    totalUniqueDomain: number = 0;
    totalUniqueDomainDelta: number = 0;
    totalUniqueBlockedDomainForDashboard: number = 0;
    totalUniqueBlockedDomainForDashboardDelta: number = 0;
    securityRiskCountForDashboard: number = 0;
    securityRiskCountForDashboardDelta: number = 0;
    uSecurityRiskCountForDashboard: number = 0;
    uSecurityRiskCountForDashboardDelta: number = 0;
    grayCountForDashboard: number = 0;
    grayCountForDashboardDelta: number = 0;
    uGrayCountForDashboard: number = 0;
    uGrayCountForDashboardDelta: number = 0;
    riskScore: number = 0;
    hitAverages: number[] = [];
    totalHits: number[] = [];
    totalBlocks: number[] = [];
    blockAverages: number[] = [];
    uniqueDomain: number[] = []
    uniqueBlockedDomain: number[] = []
    uniqueDomainAvg: number[] = []
    uniqueSubdomain: number[] = []
    uniqueSubdomainAvg: number[] = []
    uniqueDesIp: number[] = []
    uniqueDesIpAvg: number[] = []

    /**
     *
     */
    constructor() {
        this.totalBlocks = [];
        this.hitAverages = [];
        this.totalHits = [];
        this.blockAverages = [];
        this.uniqueDomain = []
        this.uniqueDomainAvg = []
        this.uniqueSubdomain = []
        this.uniqueSubdomainAvg = []
        this.uniqueDesIp = []
        this.uniqueDesIpAvg = []
        this.uniqueBlockedDomain= []

    }
}
