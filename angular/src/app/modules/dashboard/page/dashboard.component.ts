import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashBoardService, TopDomainsRequestV4, DistinctAgentResponse, DistinctBoxResponse } from 'src/app/core/services/dashBoardService';
import { ElasticDashboardResponse } from 'src/app/core/models/ElasticDashboardResponse';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { StaticService } from 'src/app/core/services/staticService';
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
import { Box } from 'src/app/core/models/Box';
import { AstPath } from '@angular/compiler';
import { debug } from 'util';
import * as moment from 'moment';
import { ToolsService } from 'src/app/core/services/toolsService';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';

interface TagInputValue {
  value: string;
  display: string;
}

export interface RkDateButton {
  startDate: Date;
  endDate: Date;
  displayText: string;
}

declare let $: any;
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
    private translateService: TranslateService,
    private toolService: ToolsService,
    private notificationService: NotificationService,
    private staticMesssageService: StaticMessageService
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
  selectedCategory: CategoryV2|null = null;
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

  private now: Date = new Date();

  dateButtons: RkDateButton[] = [
    {
      startDate: new Date(this.now.getFullYear() , this.now.getMonth(), this.now.getDate() - 14),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 2 week'
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 7),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 1 week'
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 3),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 3  day'
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth() , this.now.getDate() - 2),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 2 day'
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 1),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 1 day'
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 10),
      displayText: 'Today (00:00-10:00)'
    },
  ];

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

  startDate: Date = new Date();

  endDate: Date = new Date();

  diffrence: number;

  maliciousDomains: Domain[] = [];
  newDomains: Domain[] = [];
  harmfulDomains: Domain[] = [];

  ngOnInit() {
    this.startDate.setDate(this.today.getDate() - 7);
    this.endDate = new Date();
    this.host = this.config.host;

    this.startDashboardOperations();

    const request = { duration: 7 * 24 } as TopDomainsRequestV4;

    this.getTopDomains(request);
    this.getAgents();
    this.agentCounts.push({ name: 'PublicIp', activeCount: 0, passiveCount: 0 });
    this.agentCounts.push({ name: 'RoamingClient', activeCount: 0, passiveCount: 0 });
    this.agentCounts.push({ name: 'DnsRelay', activeCount: 0, passiveCount: 0 });
  }

  getAgents() {
    const agentsLocation: Agent[] = [];
    const agentsBox: Agent[] = [];
    const boxes: Box[] = [];
    const agentsRoamingClient: Agent[] = [];
    const distinctAgents: DistinctAgentResponse = { items: [] };
    const distinctBoxs: DistinctBoxResponse = { items: [] };
    // wait all requests to finish
    forkJoin(

      this.agentService.getAgentLocation().map(x => {
        x.forEach(y => agentsLocation.push(y));
      }),
      this.roamingService.getClients().map(x => {
        x.forEach(y => agentsRoamingClient.push(y));
      }),

      this.boxService.getBoxes().map(x => {
        x.forEach(y => {
          if (y.agent) {
            agentsBox.push(y.agent);
          }
        });
        x.forEach(y => boxes.push(y));
      }),


      this.dashboardService.getDistinctAgent({ duration: 24 }).map(x => {
        x.items.forEach(y => distinctAgents.items.push(y));
      }),
      this.dashboardService.getDistinctBox({ duration: 24 }).map(x => {
        x.items.forEach(y => distinctBoxs.items.push(y));
      })
    ).subscribe(val => {

      const publicip: AgentCountModel = { name: 'PublicIp', activeCount: 0, passiveCount: 0 };
      const roamingclient: AgentCountModel = { name: 'RoamingClient', activeCount: 0, passiveCount: 0 };

      const dnsrelay: AgentCountModel = { name: 'DnsRelay', activeCount: 0, passiveCount: 0 };

      const serials = boxes.filter(x => (x).serial).map(x => (x).serial);

      // add box serials that are not in distinctagents
      // registered clientlardan gelen verinin box bilgileride distinct agents olarak ekleniyor
      serials.forEach(x => {
        const box = boxes.find(y => (y).serial == x);
        if (!box) { return; }
        const foundedBox = distinctBoxs.items.find(y => y.serial == x);
        if (!foundedBox) { return; }
        if (distinctAgents.items.find(y => y.id == box.id)) { return; }
        distinctAgents.items.push({ id: box.agent.id, count: 1 });
      });



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

  setDateByDateButton(dateButtonItem: RkDateButton) {
    this.startDate = dateButtonItem.startDate;
    this.endDate = dateButtonItem.endDate;

    this.dateChanged({ startDate: this.startDate, endDate: this.endDate });
  }

  translate(data: string): string {
    return this.translateService.instant(data);
  }

  getTopDomains(request: TopDomainsRequestV4) {
    this.dashboardService.getTopDomains({ ...request, type: 'malicious' }).subscribe(result => {
      if (result.items.length) {
      this.toolService.searchCategories(result.items.map(x => x.name)).subscribe(cats => {
        cats.forEach(cat => {
          const finded = result.items.find(abc => abc.name == cat.domain);
          if (finded) {
          finded.category = cat.categoryList.join(',');
          }
        });
        this.maliciousDomains = result.items;

      });
      }



    });

    this.dashboardService.getTopDomains({ ...request, type: 'new' }).subscribe(result => {

      if (result.items.length) {
      this.toolService.searchCategories(result.items.map(x => x.name)).subscribe(cats => {

        cats.forEach(cat => {
          const finded = result.items.find(abc => abc.name == cat.domain);
          if (finded) {
          finded.category = cat.categoryList.join(',');
          }
        });
        this.newDomains = result.items;

      });
      }

    });

    this.dashboardService.getTopDomains({ ...request, type: 'harmful' }).subscribe(result => {

      if (result.items.length) {
      this.toolService.searchCategories(result.items.map(x => x.name)).subscribe(cats => {
        cats.forEach(cat => {
          const finded = result.items.find(abc => abc.name == cat.domain);
          if (finded) {
          finded.category = cat.categoryList.join(',');
          }
        });
        this.harmfulDomains = result.items;

      });
      }


    });
  }

  calculateDomainHitPercentage(value: number): number {
    if (!this.trafficAnomaly.total) {
      return 0;
    }
    return (value / (this.trafficAnomaly.total.allowCount + this.trafficAnomaly.total.blockCount)) || 0;
  }

  infoboxChanged($event: { active: boolean }, type: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful') {

    const trafficAnomalyType = this.trafficAnomaly[type];
    this.selectedCategoryForTraffic = null;
    this.selectedCategory = null;
    if (trafficAnomalyType) {
      this.categoryListFiltered = trafficAnomalyType.categories;
    }

    this.selectedBox = type;

    Object.keys(this.infoBoxes).forEach(elem => {
      this.infoBoxes[elem] = false;
    });

    this.infoBoxes[type] = true;
    this.drawChartAnomaly();
  }

  dateChanged(ev: { startDate: Date, endDate: Date }) {
    this.startDate = ev.startDate;
    this.endDate = ev.endDate;

    // const dates = this.getDatesTwoDaysBetween(this.startDate, this.endDate).map(x => moment(x));

    const startDate = moment([ev.startDate.getFullYear(), ev.startDate.getMonth(), ev.startDate.getDate()]);
    const endDate = moment([ev.endDate.getFullYear(), ev.endDate.getMonth(), ev.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');

    this.diffrence = diff;

    const request = { duration: diff * 24 } as TopDomainsRequestV4;
    // this.drawChartTimeLine();
    this.drawChartAnomaly();
    this.getTopDomains(request);
  }

  drawUniqueDomainChart(data: Result[]) {
    if (!data) { return; }

    const series = [{
      name: 'Hits',
      type: 'line',
      data: data.map(x => [Date.parse(x.date), x.hit])
    }];

    if (this.uniqueDomainChart) {
      this.uniqueDomainChart.updateSeries(series);
      return;
    }


    this.uniqueDomainChart = new ApexCharts(document.querySelector('#unique-chart'), {
      series: series,
      chart: {
        id: 'unique-chart2',
        type: 'line',
        height: 350,
        toolbar: {
          show: false,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: []
          },
          autoSelected: 'zoom'
        }
      }/* ,
      markers: {
        size: [2, 0],
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      } */,
      colors: ['#0084ff', '#0084ff'],
      stroke: {
        width: 2,
        curve: ['smooth']
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        enabled: true,
        shared: true,
        x: {
          format: 'MMM dd yyyy HH:mm'
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: true,
          trim: true,
          showDuplicates: false,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        tickAmount: 8
      }
    });
    this.uniqueDomainChart.render();
  }

  // onCategoryClick(cat) { }

  private calculateTotalTrafficTimeLine(summary: any, start: Date, end: Date): any[] {
    if (!summary || !summary.items) { return []; }
    return summary.items.filter(x => {
      const date = Date.parse(x.date);
      return date >= start.getTime() && date <= end.getTime();
    }).map(x => {
      return { date: new Date(Date.parse(x.date)), hit: x.total_hit.count };
    });
  }

  private addDays(date: Date) {
    date.setDate(date.getDate() + 1);
    return date;
  }

  private getEqualDates(startDate: Date, endDate: Date) {
    return `${startDate.getDate()}-${startDate.getMonth()}-${startDate.getFullYear()}` === `${endDate.getDate()}-${endDate.getMonth()}-${endDate.getFullYear()}`;
  }

  private getDatesTwoDaysBetween(startDate: Date, endDate: Date): string[] {
    let currentDate = startDate;
    const dates = [];

    while (!this.getEqualDates(currentDate, endDate)) {
      dates.push(currentDate.toISOString());

      currentDate = this.addDays(currentDate);
    }

    return dates;
  }

  private drawChartTimeLine() {
    const timelineChart = this.calculateTotalTrafficTimeLine(this.elasticData, this.startDate, this.endDate);

    this.trafficAnomaly = this.calculateTrafficAnomaly(this.elasticData, this.startDate, this.endDate, this.selectedCategoryForTraffic);
    const istatistic: TrafficAnomalyItem | TrafficAnomalyItem2 = this.trafficAnomaly[this.selectedBox];

    this.categoryListFiltered = istatistic.categories;

    const series = [{
      name: 'Hits',
      data: timelineChart.map(x => [x.date.getTime(), x.hit])
    }];

    if (this.timeLineChart) {
      this.timeLineChart.updateSeries(series);
      return;
    }

    this.timeLineChart = new ApexCharts(document.querySelector('#timeline'), {
      series: series,
      chart: {
        id: 'chart1',
        height: 200,
        type: 'bar',
        group: 'deneme',
        zoom: {
          enabled: true
        },
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: []
          },
          autoSelected: 'zoom'
        },
        /*  brush: {
           target: 'chart2',
           enabled: true
         }, */

      },
      dataLabels: {
        enabled: false,

      },
      markers: {

        size: [2, 2, 2],
        colors: ['#f95656'],
        strokeColors: '#f95656',
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      colors: ['#ff7b00', '#b1dcff', '#eedcff'],
      stroke: {
        width: 3,
        curve: ['smooth', 'smooth', 'smooth']
      },
      events: {
        beforeMount: (chartContext, config) => {

        },
        updated: (chart) => {

        }
      },
      tooltip: {
        enabled: true,
        marker: {
          show: false
        }
      },
      xaxis: {
        type: 'datetime',

        labels: {
          show: true,
          trim: true,
          showDuplicates: false,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        tickAmount: 12



      },
      yaxis: {
        tickAmount: undefined
      }
    });

    this.timeLineChart.render();
  }



  private drawChartAnomaly(catId: number = 0) {
    //  const chartData = [];



    const timelineChart = this.calculateTotalTrafficTimeLine(this.elasticData, this.startDate, this.endDate);

    /*  timelineChart.forEach(elem => {
       // timelineData.push([elem.date.toString(), elem.hit]);
       chartData.push([elem.date.toString(), elem.hit]);
     }); */

    this.trafficAnomaly = this.calculateTrafficAnomaly(this.elasticData, this.startDate, this.endDate, this.selectedCategoryForTraffic);
    const istatistic: TrafficAnomalyItem | TrafficAnomalyItem2 = this.trafficAnomaly[this.selectedBox];



    this.categoryListFiltered = istatistic.categories;
    const times = timelineChart.map(x => x.date.getTime());
    const series = [
       { name: 'Min', type: 'area', data: istatistic.averages.map((x, index) => x - istatistic.std_deviations[index]).map((x, index) => [ times[index], Math.round(x) >= 0 ? Math.round(x) : 0]) },
       { name: 'Max', type: 'area', data: istatistic.averages.map((x, index) => x + istatistic.std_deviations[index]).map((x, index) => [times[index], Math.round(x)]) },
       { name: 'Hit', type: 'line', data: istatistic.hits.map((x, index) => [times[index], Math.round(x)]) }

    ];

    const anomalies = series[2].data.filter((x, index) => {
      const min = series[0].data[index][1];
      const max = series[1].data[index][1];
      const hit = x[1];

      if (hit > max || hit < min) {
        return true;
      }
      return false;
    });


    let yMax = 0;
    series.forEach(x => {
      x.data.forEach(element => {
          if (element[1] > yMax) {
          yMax = element[1];
          }
      });
    });



/*     let xaxismax=0;
    xaxismax=series[1].data.filter(x=>x) */

    // console.log(anomalies);

    const points = this.getAnnotations(anomalies);

    if (this.trafficChart) {
      this.trafficChart.destroy();
    //  this.trafficChart.
    //  return;
    }

    this.trafficChart = new ApexCharts(document.querySelector('#chart'), {
      series: series,
      chart: {
        id: 'chart2',
        type: 'line',
        stacked: false,
        group: 'deneme',
        height: 350,
        zoom: {
          enabled: true
        },
        toolbar: {
          show: false,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
            customIcons: []
          },
          autoSelected: 'zoom'
        },
        events: {
          beforeMount: (chartContext, config) => {


            // this.infoboxChanged({ active: true }, 'total');
          },
          updated: (chart) => {
            // this.trafficAnomaly = this.calculateTrafficAnomaly(this.elasticData, this.startDate, this.endDate);
          },
        },
      },
      colors: ['#ffffff', '#b1dcff', '#0084ff'],
      stroke: {
        width: 2,
        curve: ['smooth', 'smooth', 'smooth']
      },
      annotations: {
        points: points
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        shared: true,
        x: {
          format: 'MMM dd yyyy HH:mm'
        }
      },
      fill: {
        opacity: 1,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: true,
          trim: true,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm'
          },
          tickAmount: 7
        }
      },
      yaxis: {
        min: 0,
        max: yMax + 10,
        labels: {
          formatter: (value) => {
            return Math.abs(value) > 999 ? (Math.sign(value) * (Math.abs(value) / 1000)).toFixed(1) + 'K' : Math.sign(value) * Math.abs(value);
          }
        }
      },
      noData: {
        text: 'No Data',
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: '14px',
          fontFamily: undefined
        }
      }
    });

    this.trafficChart.render();
  }

  getAnnotations(data: any[][]) {
    const points = [];
    data.forEach(e => {
      const elm = {
        x: e[0],
        y: e[1],
        marker: {
          size: 3,
          fillColor: '#f95656',
          strokeColor: '#f95656',
          strokeSize: 3,
          radius: 2
        }
      };

      points.push(elm);
    });

    return points;
  }

  startDashboardOperations() {
    this.selectedCategoryForTraffic = '';
    this.selectedCategory = null;

    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
    });

    this.getElasticData();
  }

  private getElasticData() {
    this.dashboardService.getHourlyCompanySummary({ duration: 7 * 24 }).subscribe(res => {
      this.elasticData = res;
      this.elasticData.items = this.elasticData.items.sort((x, y) => {
        const x1 = Date.parse(x.date);
        const y1 = Date.parse(y.date);
        return x1 - y1;
      });
      if (!this.elasticData.items.length) {
        this.notificationService.warning(this.staticMesssageService.getDashboardNoDataFoundMessage);
      }
      this.drawChartAnomaly();
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
      this.selectedCategory = null;
    } else {
      this.selectedCategoryForTraffic = cat.name;
      this.selectedCategory = cat;
    }

    /*  const averageData = [];
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
     ]); */

    this.drawChartAnomaly();
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
  calculateCategory(categoryList: CategorySummary[], total: number): TrafficAnomalyCategory[] {
    const map: Map<string, TrafficAnomalyCategory> = new Map();

    categoryList.forEach(x => {
      if (!map.has(x.name)) {
        map.set(x.name, { name: x.name, hitCount: 0, ratio: 0, std_deviation: 0, average: 0 });
      }

      const item = map.get(x.name);

      if (item) {
        item.name = x.name;
        item.hitCount += x.hits;
        item.ratio = 0;
        item.std_deviation = x.std_deviation;
        item.average = x.average;
      }
    });
    map.forEach(x => x.ratio = (x.hitCount * 100 / total) || 0);
    return Array.from(map.values());
  }

  flatten(list) {
    return list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
    );
  }

  stdDeviation(categoryLists: CategorySummary[][], filterList: string[]) {

    return categoryLists.map(categoryList => {
      const filtered = categoryList?.filter(a => filterList.findIndex(b => a?.name == b) > -1);
      let std = 0;
      if (filtered && filtered.length) {
        std = filtered.map(x => x.std_deviation ).reduce((x, y) => x + y, 0) ;
      }
      return Math.round(std);
    });
  }
  average(categoryLists: CategorySummary[][], filterList: string[]) {

    return categoryLists.map(categoryList => {
      const filtered = categoryList?.filter(a => filterList.findIndex(b => a?.name == b) > -1);
      let std = 0;
      if (filtered && filtered.length) {
        std = filtered.map(x => x.average).reduce((x, y) => x + y, 0)  ;
      }
      return Math.round(std);
    });
  }

  hits(categoryLists: CategorySummary[][], filterList: string[]) {

    return categoryLists.map(categoryList => {
      const filtered = categoryList?.filter(a => filterList.findIndex(b => a?.name == b) > -1);
      let std = 0;
      if (filtered && filtered.length) {
        std = filtered.map(x => x.hits).reduce((x, y) => x + y, 0) ;
      }
      return Math.round(std);
    });
  }

  calculateTrafficAnomaly(summary: HourlyCompanySummaryV4Response, start: Date, end: Date, selectedCategory?: string): TrafficAnomaly {

    const filtered = summary.items.filter(x => {
      const date = Date.parse(x.date);
      return date >= start.getTime() && date <= end.getTime();
    });

    let selectedCategoryItems = null;
    if (selectedCategory) {

       selectedCategoryItems = filtered.map(x => x.category_hits).reduce((x, y) => {
        const item = y.find(z => z.name == selectedCategory);
        x.push(item);
        return x;
      }, []);
    }



    const selectedCategoryItems2 = selectedCategoryItems ? selectedCategoryItems.map(x => [x]).reduce((x, y) => {x.push(y); return x; }, []) as CategorySummary[][] : null;

    const anomaly: TrafficAnomaly = {} as TrafficAnomaly;
    anomaly.total = {} as TrafficAnomalyItem;
    anomaly.total.allowCount = filtered.map(x => x.allowed_count.count).reduce((x, y) => x + y, 0);
    anomaly.total.blockCount = filtered.map(x => x.blocked_count.count).reduce((x, y) => x + y, 0);
    anomaly.total.categories = this.calculateCategory(this.flatten(filtered.map(x => x.category_hits)), anomaly.total.allowCount + anomaly.total.blockCount);
    let selectedCategoryList = selectedCategory ? this.flatten(filtered.map(x => x.category_hits)).filter(x => x.name == selectedCategory) : null;
    anomaly.total.averageHit = Math.round((selectedCategoryList ? selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length : Math.round(filtered.map(x => x.total_hit.average).reduce((x, y) => x + y, 0) / filtered.length)) || 0);
    anomaly.total.currentHit = Math.round((selectedCategoryList ? selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length : Math.round(filtered.map(x => x.total_hit.count).reduce((x, y) => x + y, 0) / filtered.length)) || 0);
    anomaly.total.ratio = (Math.round((anomaly.total.currentHit - anomaly.total.averageHit) / anomaly.total.averageHit * 100)) || 0;


    anomaly.total.std_deviations = selectedCategory ? selectedCategoryItems.map(x => x ? x.std_deviation  : 0) : filtered.map(x => x.total_hit.std_deviation );
    anomaly.total.averages = selectedCategory ? selectedCategoryItems.map(x => x ? x.average : 0) : filtered.map(x => x.total_hit.average);
    anomaly.total.hits = selectedCategory ? selectedCategoryItems.map(x => x ? x.hits : 0) : filtered.map(x => x.total_hit.count);



    anomaly.harmful = {} as TrafficAnomalyItem2;

    let category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.harmful.indexOf(x.name) > -1);
    anomaly.harmful.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.harmful.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.harmful.categories = this.calculateCategory(category_hits, anomaly.total.allowCount + anomaly.total.blockCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.harmful.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.harmful.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.harmful.ratio = (Math.round((anomaly.harmful.currentHit - anomaly.harmful.averageHit) / anomaly.harmful.averageHit * 100)) || 0;


    anomaly.harmful.std_deviations = selectedCategory ? this.stdDeviation(selectedCategoryItems2, this.categoryMappings.harmful) : this.stdDeviation(filtered.map(x => x.category_hits), this.categoryMappings.harmful);
    anomaly.harmful.averages = selectedCategory ? this.average(selectedCategoryItems2, this.categoryMappings.harmful) : this.average(filtered.map(x => x.category_hits), this.categoryMappings.harmful);
    anomaly.harmful.hits = selectedCategory ? this.hits(selectedCategoryItems2, this.categoryMappings.harmful) : this.hits(filtered.map(x => x.category_hits), this.categoryMappings.harmful);


    anomaly.safe = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.safe.indexOf(x.name) > -1);
    anomaly.safe.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.safe.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.safe.categories = this.calculateCategory(category_hits, anomaly.safe.hitCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.safe.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.safe.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.safe.ratio = (Math.round((anomaly.safe.currentHit - anomaly.safe.averageHit) / anomaly.safe.averageHit * 100)) || 0;

    anomaly.safe.std_deviations = selectedCategory ? this.stdDeviation(selectedCategoryItems2, this.categoryMappings.safe) : this.stdDeviation(filtered.map(x => x.category_hits), this.categoryMappings.safe);
    anomaly.safe.averages = selectedCategory ? this.average(selectedCategoryItems2, this.categoryMappings.safe) : this.average(filtered.map(x => x.category_hits), this.categoryMappings.safe);
    anomaly.safe.hits = selectedCategory ? this.hits(selectedCategoryItems2, this.categoryMappings.safe) : this.hits(filtered.map(x => x.category_hits), this.categoryMappings.safe);


    anomaly.malicious = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits).concat()).filter(x => this.categoryMappings.malicious.indexOf(x.name) > -1);
    anomaly.malicious.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.malicious.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.malicious.categories = this.calculateCategory(category_hits, anomaly.malicious.hitCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.malicious.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.malicious.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.malicious.ratio = (Math.round((anomaly.malicious.currentHit - anomaly.malicious.averageHit) / anomaly.malicious.averageHit * 100)) || 0;

    anomaly.malicious.std_deviations = selectedCategory ? this.stdDeviation(selectedCategoryItems2, this.categoryMappings.malicious) : this.stdDeviation(filtered.map(x => x.category_hits), this.categoryMappings.malicious);
    anomaly.malicious.averages = selectedCategory ? this.average(selectedCategoryItems2, this.categoryMappings.malicious) : this.average(filtered.map(x => x.category_hits), this.categoryMappings.malicious);
    anomaly.malicious.hits = selectedCategory ? this.hits(selectedCategoryItems2, this.categoryMappings.malicious) : this.hits(filtered.map(x => x.category_hits), this.categoryMappings.malicious);



    anomaly.variable = {} as TrafficAnomalyItem2;
    category_hits = this.flatten(filtered.map(x => x.category_hits)).filter(x => this.categoryMappings.variable.indexOf(x.name) > -1);
    anomaly.variable.hitCount = category_hits.map(x => x.hits).reduce((x, y) => x + y, 0);
    anomaly.variable.uniqueCount = category_hits.map(x => x.unique_domain).reduce((x, y) => x + y, 0);
    anomaly.variable.categories = this.calculateCategory(category_hits, anomaly.variable.hitCount);
    selectedCategoryList = selectedCategory ? category_hits?.filter(x => x.name == selectedCategory) : category_hits;
    anomaly.variable.averageHit = (Math.round(selectedCategoryList.map(x => x.average).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.variable.currentHit = (Math.round(selectedCategoryList.map(x => x.hits).reduce((x, y) => x + y, 0) / selectedCategoryList.length)) || 0;
    anomaly.variable.ratio = (Math.round((anomaly.variable.currentHit - anomaly.variable.averageHit) / anomaly.variable.averageHit * 100)) || 0;

    anomaly.variable.std_deviations = selectedCategory ? this.stdDeviation(selectedCategoryItems2, this.categoryMappings.variable) : this.stdDeviation(filtered.map(x => x.category_hits), this.categoryMappings.variable);
    anomaly.variable.averages = selectedCategory ? this.average(selectedCategoryItems2, this.categoryMappings.variable) : this.average(filtered.map(x => x.category_hits), this.categoryMappings.variable);
    anomaly.variable.hits = selectedCategory ? this.hits(selectedCategoryItems2, this.categoryMappings.variable) : this.hits(filtered.map(x => x.category_hits), this.categoryMappings.variable);



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


      result.items = result.items.sort((x, y) => {
        const x1 = Date.parse(x.date);
        const y1 = Date.parse(y.date);
        return x1 - y1;
      });



      this.drawUniqueDomainChart(result.items);
    });
  }

  showSummary() {
    this.router.navigateByUrl(`/admin/reports/custom-reports?category=${this.selectedCategory?.name || this.selectedBox}&startDate=${moment(this.startDate).toISOString()}&endDate=${moment(this.endDate).toISOString()}`);
  }

  showDetail() {
    const url = (`/admin/reports/monitor?category=${this.selectedCategory?.name || this.selectedBox}&startDate=${moment(this.startDate).toISOString()}&endDate=${moment(this.endDate).toISOString()}`);
    this.router.navigateByUrl(url);
  }

}
