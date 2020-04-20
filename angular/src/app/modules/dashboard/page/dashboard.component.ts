import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashBoardService, TopDomainsRequestV4, DistinctAgentResponse, DistinctBoxResponse } from 'src/app/core/services/dashBoardService';

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
  AgentCountModel, DateParamModel, HourlyCompanySummaryV5Response, Domain, TopDomainsRequestV5, Result, TopDomainValuesResponseV4, Category, Bucket
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
  trafficAnomaly: HourlyCompanySummaryV5Response;
  dateParameter = 0;
  // ds: DashboardStats = new DashboardStats();
  searchKey: string;
  labelArray: string[] = [];
  // categoryList = [];
  categoryListFiltered: Category[] = [];

  selectedCategory: CategoryV2 | null = null;
  trafficChart: any;
  timeLineChart: any;

  topDomainChart: any;
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
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 14),
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
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 2),
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

  topDomains: Domain[] = [];


  ngOnInit() {
    this.startDate.setDate(this.today.getDate() - 7);
    this.endDate = new Date();
    this.host = this.config.host;

    this.startDashboardOperations();

    const request: TopDomainsRequestV5 = { duration: 30 * 24, type: 'total' } as TopDomainsRequestV5;

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
        const box = boxes.find(y => (y).serial === x);
        if (!box) { return; }
        const foundedBox = distinctBoxs.items.find(y => y.serial === x);
        if (!foundedBox) { return; }
        if (distinctAgents.items.find(y => y.id === box.id)) { return; }
        distinctAgents.items.push({ id: box.agent.id, count: 1 });
      });



      // calcuate location agents
      distinctAgents.items.forEach(x => {
        if (agentsLocation.find(y => y.id === x.id)) {
          publicip.activeCount++;
        }
      });
      publicip.passiveCount = agentsLocation.length - publicip.activeCount;

      // calculate roaming clients
      distinctAgents.items.forEach(x => {
        if (agentsRoamingClient.find(y => y.id === x.id)) {
          roamingclient.activeCount++;
        }
      });
      roamingclient.passiveCount = agentsRoamingClient.length - roamingclient.activeCount;


      // calculate box
      distinctAgents.items.forEach(x => {
        if (agentsBox.find(y => y.id === x.id)) {
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

  getTopDomains(request: TopDomainsRequestV5) {

    this.dashboardService.getTopDomains(request).subscribe(result => {
        if (result.items.length) {
         this.toolService.searchCategories(result.items.map(x => x.name)).subscribe(cats => {
           cats.forEach(cat => {
             const finded = result.items.find(abc => abc.name == cat.domain);
             if (finded) {
               finded.category = cat.categoryList.join(',');
             }
           });
           this.topDomains = result.items;

         });
       }



    });



  }



  infoboxChanged($event: { active: boolean }, type: 'total' | 'safe' | 'malicious' | 'variable' | 'harmful') {



    this.selectedCategory = null;

    this.selectedBox = type;

    Object.keys(this.infoBoxes).forEach(elem => {
      this.infoBoxes[elem] = false;
    });

    this.infoBoxes[type] = true;
    this.drawChartAnomaly();

    this.refreshTopDomains();

  }

  calculateDateDiff(): number {
    const startDate = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
    const endDate = moment([this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');
    return diff;

  }

  dateChanged(ev: { startDate: Date, endDate: Date }) {
    this.startDate = ev.startDate;
    this.endDate = ev.endDate;



    const diff = this.calculateDateDiff();
    this.diffrence = diff;



    this.drawChartAnomaly();

   this.refreshTopDomains();
  }

  drawTopDomainChart(response: TopDomainValuesResponseV4) {

    if (!response || !response.items) { return; }
    const data = response.items;
    const series = [{
      name: 'Hits',
      type: 'line',
      data: data.map(x => [Date.parse(moment(x.date).utc(true).toLocaleString()), x.hit])
    }];

    if (this.topDomainChart) {
      this.topDomainChart.updateSeries(series);
      return;
    }


    this.topDomainChart = new ApexCharts(document.querySelector('#topDomainChart'), {
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
    this.topDomainChart.render();
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

/*   private drawChartTimeLine() {
    const timelineChart = [];

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

    /*  },
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
  } */



  private drawChartAnomaly() {

    // calculate categories
    this.categoryListFiltered = [];
    if (this.trafficAnomaly?.categories ) {
      for (const cat of this.trafficAnomaly.categories) {
        cat.hit = cat.buckets.map(x => x.sum).reduce((x, y) => x + y);
        cat.hit_ratio = Math.floor(cat.hit / (this.trafficAnomaly.total.hit + this.trafficAnomaly.total.block) * 100);
        if (this.selectedBox === 'total') {
          this.categoryListFiltered.push(cat);
        } else if (cat.type === this.selectedBox) {
          this.categoryListFiltered.push(cat);
        }
      }
    }
    // sort descending
    this.categoryListFiltered = this.categoryListFiltered.sort((x, y) => {
      if (x.hit === y.hit) {
        return x.name.localeCompare(y.name);
      }
      return (x.hit - y.hit) * -1;

    });


    const istatistic = { averages: [], std_deviations: [], hits: [] };

    // calculate chart
    const whichBox = this.trafficAnomaly[this.selectedBox];
    const buckets: Bucket[] = this.selectedCategory ? this.trafficAnomaly.categories.find(x => x.name === this.selectedCategory.name)?.buckets : whichBox.buckets;
    istatistic.std_deviations = buckets.map(x => x.std);
    istatistic.averages = buckets.map(x => x.avg);
    istatistic.hits = buckets.map(x => x.sum);



    const timelineChart = [];
    const times = whichBox.buckets.map(x => moment(x.date).utc(true).toDate().getTime());
    const series = [
      { name: 'Min', type: 'area', data: istatistic.averages.map((x, index) => x - istatistic.std_deviations[index]).map((x, index) => [times[index], Math.round(x) >= 0 ? Math.round(x) : 0]) },
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
        },
        // fillSeriesColor: true,
        theme: 'dark'
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
            return Math.abs(value) > 999 ? (Math.sign(value) * (Math.abs(value) / 1000)).toFixed(1) + 'K' : (Math.sign(value) * Math.abs(value)).toFixed(1);
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

    this.selectedCategory = null;

    /* this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
    }); */

    this.getTrafficAnomaly();
  }

  private  refreshTopDomains() {
     //
     const diff = this.calculateDateDiff();
     const request = { duration: diff * 24 } as TopDomainsRequestV5;
     request.type = this.selectedCategory ? this.selectedCategory.name : this.selectedBox;
     this.getTopDomains(request);
  }

  private getTrafficAnomaly() {
    this.dashboardService.getHourlyCompanySummary({ duration: 30 * 24 }).subscribe(res => {
      this.trafficAnomaly = res;
      /*   this.elasticData.items = this.elasticData.items.sort((x, y) => {
          const x1 = Date.parse(x.date);
          const y1 = Date.parse(y.date);
          return x1 - y1;
        }); */
      if (!this.trafficAnomaly.hit) {
        this.notificationService.warning(this.staticMesssageService.dashboardNoDataFoundMessage);
      }
      this.drawChartAnomaly();
    });
  }



  selectCategory(cat: CategoryV2) {
    if (cat.name === this.selectedCategory?.name) {

      this.selectedCategory = null;
    } else {

      this.selectedCategory = cat;
    }



    this.drawChartAnomaly();

    this.refreshTopDomains();

  }



  flatten(list) {
    return list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
    );
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



      this.drawTopDomainChart(result);
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
