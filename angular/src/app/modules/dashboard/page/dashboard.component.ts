import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashBoardService, TopDomainsRequestV4, DistinctAgentResponse } from 'src/app/core/services/DashBoardService';
import { ElasticDashboardResponse } from 'src/app/core/models/ElasticDashboardResponse';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { DashboardStats } from 'src/app/core/models/DashboardStats';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/core/services/agent.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { BoxService } from 'src/app/core/services/box.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import {
  AgentCountModel, DateParamModel, TrafficAnomaly, Domain, HourlyCompanySummaryV4Response,
  TrafficAnomalyItem, CategorySummary, TrafficAnomalyCategory, TrafficAnomalyItem2, Result
} from 'src/app/core/models/Dashboard';
import { KeyValueModel, TimeRangeEnum } from 'src/app/core/models/Utility';
import { RkApexHelper } from 'roksit-lib';
import { ValidationService } from 'src/app/core/services/validation.service';
import { TranslateService } from '@ngx-translate/core';
import { Agent } from 'src/app/core/models/Agent';
import { Observable, forkJoin } from 'rxjs';
import { fork } from 'cluster';

interface TagInputValue {
  value: string;
  display: string;
}

declare let $: any;
declare let moment: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private dashboardService: DashBoardService,
    private staticService: StaticService,
    private agentService: AgentService,
    private boxService: BoxService,
    private roamingService: RoamingService,
    private router: Router,
    private config: ConfigService,
    private translateService: TranslateService
  ) { }

  host: ConfigHost;
  elasticData: HourlyCompanySummaryV4Response;
  dateParameter = 0;
  ds: DashboardStats = new DashboardStats();
  searchKey: string;
  labelArray: string[] = [];
  categoryList = [];
  categoryListFiltered = [];
  selectedCategoryForTraffic: string;
  selectedCategoryForUnique = CategoryV2;
  trafficChart: any;
  timeLineChart: any;

  uniqueDomainChart: any;
  trafficChartType = 'hit';
  uniqueChartType = 'domain';

  agentCounts: AgentCountModel[] = [];
  timeRangeButtons: DateParamModel[] = [];
  totalCategoryHits = 0;

  infoBoxes = {
    total: true,
    safe: false,
    malicious: false,
    variable: false,
    harmful: false
  };

  selectedBox: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful' = 'total';

  trafficAnomaly: TrafficAnomaly = {} as TrafficAnomaly;

  items: TagInputValue[] = [];

  categoryMappings = {
    'variable': [
      'Unknown',
      'Undecided Not Safe',
      'Undecided Safe',
      'Domain Parking',
      'Newly Register',
      'Newly Up',
      'Dead Sites',
      'Firstly Seen'
    ],
    'harmful': [
      'Illegal Drugs',
      'Adult',
      'Pornography',
      'Hate/Violance/illegal',
      'Gambling',
      'Games',
      'Swimsuits and Underwear',
      'Dating',
      'Alcohol'
    ],
    'safe': [
      'Cooking',
      'Online Video',
      'Sport',
      'Advertisements',
      'Shopping',
      'Software Downloads',
      'Reference',
      'Financial Services',
      'Health',
      'Society',
      'Webmail',
      'Vehicles',
      'Government and Organization',
      'Search Engines',
      'Online Storage',
      'Business Services',
      'Entertainment',
      'Tobacco',
      'Blogs',
      'Content Delivery Networks (CDN)',
      'Social Networks',
      'Real Estate',
      'Forums',
      'Arts and Culture',
      'Kids',
      'Job Search',
      'Clothing and Fashion',
      'Chats',
      'Education',
      'Technology and Computer',
      'Infrastructure Service',
      'Music',
      'Weapon and Military',
      'News',
      'Religion',
      'Vacation and Travel',
      'Local IP',
      'WhiteList'
    ],
    'malicious': [
      'Phishing',
      'Spam Sites',
      'Proxy',
      'Warez',
      'Hacking',
      'Potentially Dangerous',
      'Malware/Virus',
      'Dynamic DNS',
      'Botnet CC',
      'DGA Domain',
      'BlackList',
      'Malformed Query',
      'Bad-IP',
      'NX Domain'
    ]
  };

  private today: Date = new Date();

  private startDate: Date = new Date();

  private endDate: Date = new Date();

  maliciousDomains: Domain[] = [];
  newDomains: Domain[] = [];
  harmfulDomains: Domain[] = [];

  ngOnInit() {
    this.startDate.setDate(this.today.getDate() - 365);

    this.host = this.config.host;

    this.startDashboardOperations();

    const request = { duration: 24 * 365 } as TopDomainsRequestV4;

    this.getTopDomains(request);
    this.getAgents();
    this.agentCounts.push({ name: 'PublicIp', activeCount: 0, passiveCount: 0 });
    this.agentCounts.push({ name: 'RoamingClient', activeCount: 0, passiveCount: 0 });
    this.agentCounts.push({ name: 'DnsRelay', activeCount: 0, passiveCount: 0 });
  }

  getAgents() {
    const agentsLocation: Agent[] = [];
    const agentsBox: Agent[] = [];
    const agentsRoamingClient: Agent[] = [];
    const distinctAgents: DistinctAgentResponse = {items: []};
    // wait all requests to finish
    forkJoin(

     this.agentService.getAgentLocation().map(x => {
      x.forEach(y => agentsLocation.push(y));
    }),
    this.roamingService.getClients().map(x => {
      x.forEach(y => agentsRoamingClient.push(y));
    }),

    this.boxService.getBoxes().map(x => {
      x.forEach(y => agentsBox.push(y.agent));
    }),

    this.dashboardService.getDistinctAgent({duration: 24}).map(x => {
      x.items.forEach(y => distinctAgents.items.push(y));
    })
    ).subscribe(val => {

      const publicip: AgentCountModel = { name: 'PublicIp', activeCount: 0 , passiveCount: 0 };
      const roamingclient: AgentCountModel = { name: 'RoamingClient', activeCount: 0, passiveCount: 0 };

      const dnsrelay: AgentCountModel = { name: 'DnsRelay', activeCount: 0, passiveCount: 0 };

      // calcuate location agents
      distinctAgents.items.forEach(x => {
        if (agentsLocation.find(y => y.id == x.id)) {
        publicip.activeCount++;
        }
      });
      publicip.passiveCount = agentsLocation.length - publicip.activeCount;

      // calculate roaming clients
      distinctAgents.items.forEach(x => {
        if (agentsRoamingClient.find(y => y.id == x.id)) {
        roamingclient.activeCount++;
        }
      });
      roamingclient.passiveCount = agentsRoamingClient.length - roamingclient.activeCount;

      // calculate box
      distinctAgents.items.forEach(x => {
        if (agentsBox.find(y => y.id == x.id)) {
        dnsrelay.activeCount++;
        }
      });
      dnsrelay.passiveCount = agentsBox.length - dnsrelay.activeCount;
      ///
      this.agentCounts = [publicip, roamingclient, dnsrelay];

    });
  }

  translate(data: string): string {
    return this.translateService.instant(data);
  }

  getTopDomains(request: TopDomainsRequestV4) {
    this.dashboardService.getTopDomains({ ...request, type: 'malicious' }).subscribe(result => {
      this.maliciousDomains = result.items;
    });

    this.dashboardService.getTopDomains({ ...request, type: 'new' }).subscribe(result => {
      this.newDomains = result.items;
    });

    this.dashboardService.getTopDomains({ ...request, type: 'harmful' }).subscribe(result => {
      this.harmfulDomains = result.items;
    });
  }

  infoboxChanged($event: { active: boolean }, type: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful') {
    
    const trafficAnomalyType = this.trafficAnomaly[type];

    if (trafficAnomalyType) {
      this.categoryListFiltered = trafficAnomalyType.categories;
    }

    this.selectedBox = type;

    Object.keys(this.infoBoxes).forEach(elem => {
      this.infoBoxes[elem] = false;
    });

    this.infoBoxes[type] = true;
  }

  dateChanged(ev: { startDate: Date, endDate: Date }) {
    this.startDate = ev.startDate;
    this.endDate = ev.endDate;

    // this.startDashboardOperations();

    const startDate = moment([ev.startDate.getFullYear(), ev.startDate.getMonth(), ev.startDate.getDate()]);
    const endDate = moment([ev.endDate.getFullYear(), ev.endDate.getMonth(), ev.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');

    const request = { duration: diff * 24 } as TopDomainsRequestV4;
    this.prepareTimeline();
    this.getTopDomains(request);
  }

  prepareUniqueChart(data: Result[]) {
    if (!data) { return; }

    RkApexHelper.render('#unique-chart', {
      series: [
        { name: 'Normal Traffic Count', type: 'line', data: data.map(x => x.hit) },
      ],
      chart: {
        id: 'unique-chart2',
        type: 'line',
        height: 350,
        toolbar: {
          autoSelected: 'pan',
          show: false
        }
      },
      markers: {
        size: [4, 0],
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      colors: ['#f95656', '#f95656'],
      stroke: {
        width: 4,
        curve: ['smooth']
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      xaxis: {
        categories: data.map(x => moment(x.date).format('DD-MM-YYYY HH:mm'))
      }
    });
  }

  // onCategoryClick(cat) { }

  private calculateTotalTrafficTimeLine(summary: any, start: Date, end: Date): any[] {
    return summary.items.filter(x => {
      const date = Date.parse(x.date);
      return date >= start.getTime() && date <= end.getTime();
    }).map(x => {
      return { date: new Date(Date.parse(x.date)), hit: x.total_hit.count };
    });
  }

  private prepareTimeline(catId: number = 0) {
    const chartData = [];

    const timelineData = [];

    const timelineChart = this.calculateTotalTrafficTimeLine(this.elasticData, this.startDate, this.endDate);

    timelineChart.forEach(elem => {
      timelineData.push([elem.date.toString(), elem.hit]);
      chartData.push([elem.date.toString(), elem.hit]);
    });

    if (this.trafficChart) {
      this.trafficChart.destroy();
    }

    this.trafficChart = new ApexCharts(document.querySelector('#chart'), {
      series: [
        { name: 'Normal Traffic Count', type: 'line', data: timelineData },
        { name: 'Hit Count', type: 'area', data: chartData }
      ],
      chart: {
        id: 'chart2',
        type: 'line',
        height: 350,
        toolbar: {
          autoSelected: 'pan',
          show: false
        },
        events: {
          beforeMount: (chartContext, config) => {
            this.trafficAnomaly = this.calculateTrafficAnomaly(this.elasticData, this.startDate, this.endDate);

            this.infoboxChanged({ active: true }, 'total');
          },
          updated: (chart) => {
            this.trafficAnomaly = this.calculateTrafficAnomaly(this.elasticData, this.startDate, this.endDate);
          },
        },
      },
      markers: {
        size: [4, 0],
        colors: ['#f95656'],
        strokeColors: '#f95656',
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      colors: ['#0084ff', '#b1dcff'],
      stroke: {
        width: 3,
        curve: ['straight', 'smooth']
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      xaxis: {
        type: 'datetime'
      }
    });

    this.trafficChart.render();

    if (this.timeLineChart) {
      this.timeLineChart.destroy();
    }

    this.timeLineChart = new ApexCharts(document.querySelector('#timeline'), {
      series: [{
        data: timelineData
      }],
      chart: {
        id: 'chart1',
        height: 120,
        type: 'bar',
        brush: {
          target: 'chart2',
          enabled: true
        },
        selection: {
          enabled: true,
          type: 'x',
          fill: {
            color: 'transparent',
            opacity: 0.1
          },
          stroke: {
            width: 4,
            color: '#3397c5',
            opacity: 1,
            dashArray: 0,
            radius: 50
          },
          xaxis: {},
        },
      },
      colors: [function ({ value, seriesIndex, w }) {
        if (value < 55) {
          return '#f95656';
        } else if (value >= 55 && value < 80) {
          return '#3dd49a';
        } else {
          return '#f99256';
        }
      }],
      xaxis: {
        type: 'datetime',
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        tickAmount: 2
      }
    });

    this.timeLineChart.render();
  }

  startDashboardOperations() {
    this.selectedCategoryForTraffic = '';
    this.selectedCategoryForUnique = null;

    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
    });

    this.getElasticData();
  }

  private getElasticData() {
    this.dashboardService.getHourlyCompanySummary({ duration: 365 * 24 }).subscribe(res => {
      this.elasticData = res;

      this.prepareTimeline();
    });
  }

 /*  updateCharts() {
    this.getElasticData();
  } */

  /* calculatePercentage(num1: number, num2: number) {
    return Math.round((num2 - num1) / num1 * 100);
  } */

  /* changeTrafficChartData(type: string) {
    this.trafficChartType = type;
  } */

  /* searchCategoryForTraffic(val: any) {
    this.categoryListFiltered = this.categoryList.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
  } */

  addCategoryToTraffic(cat: CategoryV2) {
    if (cat.name === this.selectedCategoryForTraffic) {
      this.selectedCategoryForTraffic = '';
    } else {
      this.selectedCategoryForTraffic = cat.name;
    }
debugger;
    const averageData = [];
    const hitData = [];

    for (let i = 0; i < this.elasticData.items.length; i++) {
      const elData = this.elasticData.items[i];

      const label = moment(elData.date).format('YYYY-MM-DD HH:mm');


      if (this.selectedCategoryForTraffic === '') {
        averageData.push([label, elData.total_hit]);
        hitData.push([label, elData.total_hit]);
      } else {
        this.selectedCategoryForTraffic = this.categoryList.find(c => c.name === cat.name).name;

        const catData = elData.category_hits.find(x => x.name === this.selectedCategoryForTraffic);

        if (catData) {
          const average = catData.average ? catData.average.toFixed(2) : 0;

          averageData.push([label, average]);
          hitData.push([label, catData.hits.toFixed(2)]);
        }
      }
    }

    this.trafficChart.updateSeries([
      { name: cat.name + ' Normal Traffic Count', data: averageData, type: 'line' },
      { name: 'Hit Count', type: 'area', data: hitData }
    ]);

    this.timeLineChart.updateSeries([
      { data: hitData },
    ]);
  }

 /*  deleteCatFromTraffic(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForTraffic = '';
      this.trafficChart.updateSeries([{ name: 'Today Hits', data: this.ds.totalHits }, { name: 'Average Hits', data: this.ds.hitAverages }]);
    }
  } */

/*   addCategoryToUnique(id: number) {
    this.selectedCategoryForUnique = this.categoryList.find(c => c.id === id);
    const catName = this.selectedCategoryForUnique.name;
    const catHits = [], catAvs = [];
    const indexLimit = this.dateParameter === -1 ? this.elasticData.items.length - 1 : 0;
    for (let i = indexLimit; i < this.elasticData.items.length; i++) {
      const data = this.elasticData[i];

      Object.keys(data.category_hits).forEach(function eachKey(key) {
        if (key.toString() === catName) {
          catHits.push(data.category_hits[key].unique_domain);
          catAvs.push(Math.round(data.category_hits[key].unique_domain_average));
        }
      });
    }

    this.uniqueDomainChart.updateSeries([{ name: catName + 'Unique Domain', data: catHits }, { name: 'Unique Domain Avg', data: catAvs }]);

    this.resetCategoryListFiltered();
  } */
/*
  deleteCatFromUnique(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForUnique = null;
      this.uniqueDomainChart.updateSeries([{ name: 'Unique Domain', data: this.ds.uniqueDomain }, { name: 'Unique Domain Avg', data: this.ds.uniqueDomainAvg }]);
    }
  }
 */
 /*  private resetCategoryListFiltered() {
    this.searchKey = null;
    this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => a.name > b.name ? 1 : -1))); // deep copy
  } */

  /* showInReport(param: string) {
    localStorage.setItem('dashboardParam', param + '&' + this.dateParameter);
    this.router.navigate(['/admin/reports/customreport']);
  }
 */
  calculateCategory(categoryList: CategorySummary[], total: number ): TrafficAnomalyCategory[] {
    const map: Map<string, TrafficAnomalyCategory> = new Map();

    categoryList.forEach(x => {
      if (!map.has(x.name)) {
        map.set(x.name, { name: x.name, hitCount: 0, ratio: 0 });
      }

      const item = map.get(x.name);

      if (item) {
        item.name = x.name;
        item.hitCount += x.hits;
        item.ratio = 0;
      }
    });
    map.forEach(x => x.ratio = (x.hitCount / total) || 0);
    return Array.from(map.values());
  }

  flatten(list) {
    return list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
    );
  }

  calculateTrafficAnomaly(summary: HourlyCompanySummaryV4Response, start: Date, end: Date, selectedCategory?: string): TrafficAnomaly {
    const filtered = summary.items.filter(x => {
      const date = Date.parse(x.date);
      return date >= start.getTime() && date <= end.getTime();
    });
    const anomaly: TrafficAnomaly = {} as TrafficAnomaly;
    anomaly.total = {} as TrafficAnomalyItem;
    anomaly.total.allowCount = filtered.map(x => x.allowed_count.count).reduce((x, y) => x + y, 0);
    anomaly.total.blockCount = filtered.map(x => x.blocked_count.count).reduce((x, y) => x + y, 0);
    anomaly.total.categories = this.calculateCategory(this.flatten(filtered.map(x => x.category_hits)), anomaly.total.allowCount + anomaly.total.blockCount);
    let selectedCategoryList = selectedCategory ? this.flatten(filtered.map(x => x.category_hits)).filter(x => x.name == selectedCategory) : null;
    anomaly.total.averageHit = (selectedCategoryList ? selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length : Math.round(filtered.map(x => x.total_hit.average).reduce((x, y) => x + y, 0) / filtered.length)) || 0;
    anomaly.total.currentHit = (selectedCategoryList ? selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length : Math.round(filtered.map(x => x.total_hit.count).reduce((x, y) => x + y, 0) / filtered.length)) || 0;
    anomaly.total.ratio = (Math.round((anomaly.total.currentHit - anomaly.total.averageHit) / anomaly.total.averageHit * 100)) || 0;


    anomaly.harmful = {} as TrafficAnomalyItem2;
    let category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.harmful.indexOf(x.name) > -1);
    anomaly.harmful.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.harmful.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.harmful.categories = this.calculateCategory(category_hits, anomaly.total.allowCount + anomaly.total.blockCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.harmful.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.harmful.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.harmful.ratio = (Math.round((anomaly.harmful.currentHit - anomaly.harmful.averageHit) / anomaly.harmful.averageHit * 100)) || 0;

    anomaly.safe = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.safe.indexOf(x.name) > -1);
    anomaly.safe.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.safe.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.safe.categories = this.calculateCategory(category_hits,  anomaly.total.allowCount + anomaly.total.blockCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.safe.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.safe.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.safe.ratio = (Math.round((anomaly.safe.currentHit - anomaly.safe.averageHit) / anomaly.safe.averageHit * 100)) || 0;


    anomaly.malicious = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits).concat()).filter(x => this.categoryMappings.malicious.indexOf(x.name) > -1);
    anomaly.malicious.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.malicious.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.malicious.categories = this.calculateCategory(category_hits,  anomaly.total.allowCount + anomaly.total.blockCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.malicious.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.malicious.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.malicious.ratio = (Math.round((anomaly.malicious.currentHit - anomaly.malicious.averageHit) / anomaly.malicious.averageHit * 100)) || 0;


    anomaly.variable = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.variable.indexOf(x.name) > -1);
    anomaly.variable.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.variable.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.variable.categories = this.calculateCategory(category_hits,  anomaly.total.allowCount + anomaly.total.blockCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.variable.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.variable.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.variable.ratio = (Math.round((anomaly.variable.currentHit - anomaly.variable.averageHit) / anomaly.variable.averageHit * 100)) || 0;

    return anomaly;
  }

  addDomain(domain: Domain) {
    this.items = [{ display: domain.name, value: domain.name }];
  }

  onItemAdded($event: TagInputValue) {
    const isDomain = ValidationService.isDomainValid($event.value);

    if (!isDomain) {
      this.items = [];
    }
  }

  search() {
    let domain = '';

    this.items.forEach(elem => {
      domain = elem.value;
    });

    if (domain.trim().length === 0) { return; }

    const startDate = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
    const endDate = moment([this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');

    this.dashboardService.getTopDomainValue({ domain: domain, duration: diff * 24 }).subscribe(result => {
      this.prepareUniqueChart(result.items);
    });
  }
}
