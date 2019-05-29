export class DashboardStats {
    malwareCountForDashboard: number = 0;
    uMalwareCountForDashboard: number = 0;
    grayCountForDashboard: number = 0;
    uGrayCountForDashboard: number = 0;
    totalHitCountForDashboard: number = 0;
    totalBlockCountForDashboard: number = 0;
    totalUniqueDomain: number = 0;
    riskScore: number = 0;
    hitAverages: number[] = [];
    todayHits: number[] = [];
    blockAverages: number[] = [];
    todayBlocks: number[] = [];
    uniqueDomain: number[] = []
    uniqueDomainAvg: number[] = []
    uniqueSubdomain: number[] = []
    uniqueSubdomainAvg: number[] = []
    uniqueDesIp: number[] = []
    uniqueDesIpAvg: number[] = []

    /**
     *
     */
    constructor() {
        this.todayBlocks = [];
        this.hitAverages = [];
        this.todayHits = [];
        this.blockAverages = [];
        this.uniqueDomain = []
        this.uniqueDomainAvg = []
        this.uniqueSubdomain = []
        this.uniqueSubdomainAvg = []
        this.uniqueDesIp = []
        this.uniqueDesIpAvg = []

    }
}
