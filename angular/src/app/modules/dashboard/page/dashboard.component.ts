import { Component, OnInit, ViewChild } from '@angular/core';
import { DashBoardService, DistinctAgentResponse, DistinctBoxResponse } from 'src/app/core/services/dashBoardService';

import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/core/services/agent.service';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { BoxService } from 'src/app/core/services/box.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import {
  AgentCountModel, DateParamModel, HourlyCompanySummaryV5Response, Domain, TopDomainsRequestV5, TopDomainValuesResponseV4, Category, Bucket, HourlyCompanySummaryV5Request
} from 'src/app/core/models/Dashboard';
import { ValidationService } from 'src/app/core/services/validation.service';
import { TranslateService } from '@ngx-translate/core';
import { Agent } from 'src/app/core/models/Agent';
import { forkJoin } from 'rxjs';
import { Box } from 'src/app/core/models/Box';
import * as moment from 'moment';
import { ToolsService } from 'src/app/core/services/toolsService';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { RkDateConfig } from 'roksit-lib/lib/modules/rk-date/rk-date.component';
import * as numeral from 'numeral';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';

interface TagInputValue {
  value: string;
  display: string;
}

export interface RkDateButton {
  startDate: Date;
  endDate: Date;
  displayText: string;
  active: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  constructor(
    private dashboardService: DashBoardService,
    private agentService: AgentService,
    private boxService: BoxService,
    private roamingService: RoamingService,
    private router: Router,
    private config: ConfigService,
    private translateService: TranslateService,
    private toolService: ToolsService,
    private notificationService: NotificationService,
    private staticMesssageService: StaticMessageService,
    private translatorService: TranslatorService,
    private authService: AuthenticationService
  ) {
    const currentSession = this.authService.currentSession;
    this.token = currentSession.token;
    this.refreshToken = currentSession.refreshToken;
  }

  host: ConfigHost;
  trafficAnomaly: HourlyCompanySummaryV5Response;
  dateParameter = 0;
  // ds: DashboardStats = new DashboardStats();
  searchKey: string;
  labelArray: string[] = [];
  // categoryList = [];
  categoryListFiltered: Category[] = [];

  selectedCategory: CategoryV2 | Category = null;
  trafficChart: any;
  timeLineChart: any;

  topDomainChart: any;
  trafficChartType = 'hit';
  uniqueChartType = 'domain';

  agentCounts: AgentCountModel[] = [];
  timeRangeButtons: DateParamModel[] = [];
  totalCategoryHits = 0;

  token;
  refreshToken;
  navigationUrl = environment.navigationUrl;

  infoBoxes = {
    total: true,
    safe: false,
    malicious: false,
    variable: false,
    harmful: false,
    restricted: false
  };

  selectedCategoryName = 'Total';

  selectedBox: 'total' | 'safe' | 'malicious' | 'variable' | 'restricted' | 'harmful' = 'total';

  private now: Date = new Date();

  theme: any = 'light';

  dateButtons: RkDateButton[] = [
    {
      startDate: new Date(this.now.getFullYear() - 1, this.now.getMonth(), this.now.getDate()),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last Year',
      active: false,
      isToday: false
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 3, this.now.getDate()),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last 3 Month',
      active: false,
      isToday: false
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate()),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last Month',
      active: false,
      isToday: false
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 7),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
      displayText: 'Last Week',
      active: true,
      isToday: false
    },
    {
      startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0),
      endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes()),
      displayText: `Today (00:00-${this.now.getHours()}:${this.now.getMinutes()})`,
      active: false,
      isToday: true
    },
  ];
  topDomainsCountTotal: number;

  dateConfig: RkDateConfig = {
    startHourText: this.translatorService.translate('Date.StartHour'),
    endHourText: this.translatorService.translate('Date.EndHour'),
    applyText: this.translatorService.translate('Date.Apply'),
    cancelText: this.translatorService.translate('Date.Cancel'),
    customText: this.translatorService.translate('Date.Custom'),
    selectDateText: this.translatorService.translate('Date.SelectDate'),
    placeholder: this.translatorService.translate('Date.Placeholder'),
    startDate: this.translatorService.translate('Date.StartDate'),
    endDate: this.translatorService.translate('Date.EndDate'),
  };

  items: TagInputValue[] = [];

  private today: Date = new Date();

  startDate: Date = new Date();

  endDate: Date = new Date();

  dateText: string;

  topDomains: Domain[] = [];

  @ViewChild('date') date;
  showDetailButton = true;

  ngOnInit() {
    this.startDate.setDate(this.today.getDate() - 7);
    this.endDate = new Date();
    this.host = this.config.host;

    this.setDateTextByDates();

    this.getTheme();

    this.startDashboardOperations().subscribe(x => {


      const request: TopDomainsRequestV5 = { duration: 7 * 24, type: 'total' } as TopDomainsRequestV5;

      this.getTopDomains(request).subscribe(x => {
        this.agentCounts = [];
        this.agentCounts.push({ name: 'PublicIp', activeCount: 0, passiveCount: 0 });
        this.agentCounts.push({ name: 'RoamingClient', activeCount: 0, passiveCount: 0 });
        this.agentCounts.push({ name: 'DnsRelay', activeCount: 0, passiveCount: 0 });
        this.getAgents().subscribe(x => {


        });


      });
    });


  }

  private getTheme() {
    const currentUser = this.authService.currentSession?.currentUser;
    const theme = this.config.getThemeColor(currentUser?.id);
    // const theme = localStorage.getItem('themeColor') as 'light' | 'dark';

    if (theme) {
      this.theme = theme;
    } else {
      this.theme = 'white';
    }
  }

  private setDateTextByDates() {
    const startDate = moment(this.startDate);
    const endDate = moment(this.endDate);

    const minutes = endDate.diff(startDate, 'minutes');

    this.dateText = this.convertTimeString(minutes);
  }

  getAgents() {
    const agentsLocation: Agent[] = [];
    const agentsBox: Agent[] = [];
    const boxes: Box[] = [];
    const agentsRoamingClient: Agent[] = [];
    const distinctAgents: DistinctAgentResponse = { items: [] };
    const distinctBoxs: DistinctBoxResponse = { items: [] };

    // wait all requests to finish
    return forkJoin(
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
    ).map(() => {

      const publicip: AgentCountModel = { name: 'PageName.PublicIp', activeCount: 0, passiveCount: 0 };
      const roamingclient: AgentCountModel = { name: 'RoamingClient', activeCount: 0, passiveCount: 0 };

      const dnsrelay: AgentCountModel = { name: 'DnsRelay', activeCount: 0, passiveCount: 0 };

      const serials = boxes.filter(x => (x).serial).map(x => (x).serial);

      // add box serials that are not in distinctagents
      // registered clientlardan gelen verinin box bilgileride distinct agents olarak ekleniyor
      /*  serials.forEach(x => {
         const box = boxes.find(y => (y).serial === x);
         if (!box) { return; }
         const foundedBox = distinctBoxs.items.find(y => y.serial === x);
         if (!foundedBox) { return; }
         if (distinctAgents.items.find(y => y.id === box.id)) { return; }
         distinctAgents.items.push({ id: box.agent.id, count: 1 });
       }); */

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
      boxes.forEach(x => {
        if (distinctBoxs.items.find(y => y.serial === x.serial)) {
          dnsrelay.activeCount++;
        }
      });

      dnsrelay.passiveCount = agentsBox.length - dnsrelay.activeCount;

      this.agentCounts = [];
      this.agentCounts = [publicip, roamingclient, dnsrelay];
    });
  }

  setDateByDateButton(dateButtonItem: RkDateButton) {

    this.startDate = dateButtonItem.startDate;
    this.endDate = dateButtonItem.endDate;


    this.dateChanged({ startDate: this.startDate, endDate: this.endDate }, false, dateButtonItem.isToday);

    dateButtonItem.active = true;
  }

  translate(data: string): string {
    return this.translateService.instant(data);
  }

  getTopDomains(request: TopDomainsRequestV5) {
    return this.dashboardService.getTopDomains(request).map(result => {
      // reset everything
      this.topDomains = [];
      this.items = [];
      this.drawTopDomainChart({ items: [] });
      if (result.items.length) {
        this.toolService.searchCategories(result.items.map(x => x.name)).subscribe(cats => {
          cats.forEach(cat => {
            const finded = result.items.find(abc => abc.name == cat.domain);
            if (finded) {
              finded.category = cat.categoryList.join(',');
            }
          });

          this.topDomainsCountTotal = result.items.reduce((prev, cur) => prev + cur.hit, 0);

          this.topDomains = result.items;

          if (this.topDomains.length > 0) {
            this.addDomain(this.topDomains[0]);
          }
        });
      }
    });
  }

  infoboxChanged($event: { active: boolean }, type: 'total' | 'safe' | 'malicious' | 'variable' | 'restricted', selectedCategoryName: string) {
    this.selectedCategoryName = selectedCategoryName;

    this.selectedCategory = null;

    this.selectedBox = type;

    Object.keys(this.infoBoxes).forEach(elem => {
      this.infoBoxes[elem] = false;
    });

    this.infoBoxes[type] = true;
    this.drawChartAnomaly();

    this.refreshTopDomains().subscribe();
  }

  calculateDateDiff(): number {
    const startDate = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
    const endDate = moment([this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()]);

    const diff = endDate.diff(startDate, 'days');
    return diff;
  }

  getDataByTime(type: 'prev' | 'next', interval: number) {
    if (type === 'prev') {
      this.startDate.setDate(this.startDate.getDate() - interval);
      this.endDate.setDate(this.endDate.getDate() - interval);
    } else {
      this.startDate.setDate(this.startDate.getDate() + interval);
      this.endDate.setDate(this.endDate.getDate() + interval);
    }

    this.startDate = new Date(this.startDate);
    this.endDate = new Date(this.endDate);

    // this.date.selectTime({ value: 1, displayText: '' }, { startDate: this.startDate, endDate: this.endDate });

    this.dateChanged({ startDate: this.startDate, endDate: this.endDate }, true);
  }

  getDisabledNextButton(type: 'week' | 'month' | 'last3month' | string) {
    if (type === 'week') {
      const startDate = new Date(JSON.parse(JSON.stringify(this.startDate)));
      startDate.setDate(7);

      return startDate > this.today;
    }
  }
  calculateShowDetailButton() {
    console.log(`${moment(this.startDate).toISOString()}-${moment().add(-7, 'days').toISOString()}`);
    const startDate = moment(this.startDate).toDate().getTime();
    const endDate = moment(this.endDate).toDate().getTime();

    const lastWeek = moment().add(-7, 'days').startOf('day').toDate().getTime();
    const today = moment().toDate().getTime();



    this.showDetailButton = (lastWeek <= startDate && endDate <= today);
  }

  dateChanged(ev: { startDate: Date, endDate: Date }, isDateComponent = false, isToday = false) {

    this.dateButtons.forEach(elem => elem.active = false);

    this.startDate = ev.startDate;
    this.endDate = ev.endDate;
    if (moment(this.startDate) > moment(this.endDate)) {

      this.endDate = ev.startDate;
      this.startDate = ev.endDate;
      this.date.startDate = this.startDate;
      this.date.endDate = this.endDate;

    }

    this.setDateTextByDates();

    this.selectedCategory = null;

    const request = {} as HourlyCompanySummaryV5Request;

    if (isDateComponent || isToday) {
      request.startDate = this.startDate.toISOString();
      request.endDate = this.endDate.toISOString();
    } else {
      const diff = this.calculateDateDiff();

      request.duration = diff * 24;
    }

    this.calculateShowDetailButton();

    this.getTrafficAnomaly(request).subscribe(x => {
      this.refreshTopDomains().subscribe();
    });


  }

  drawTopDomainChart(response: TopDomainValuesResponseV4) {
    if (!response || !response.items) { return; }
    const data = response.items;
    const series = [{
      name: 'Hits',
      type: 'line',
      data: data.map(x => [moment(x.date).utc(true).toDate().getTime(), x.hit])
    }];

    if (this.topDomainChart) {
      this.topDomainChart.updateSeries(series);
      return;
    }

    this.topDomainChart = new ApexCharts(document.querySelector('#topDomainChart'), {
      series: series,
      chart: {
        id: 'unique-chart2',
        foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
        type: 'line',
        height: 280,
        zoom: { enabled: false },
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
      },
      colors: ['#ff6c40', '#ff6c40'],
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
      tooltip: {
        enabled: true,
        shared: true,
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          // const date = new Date(w.globals.seriesX[0][dataPointIndex]);

          const mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');

          return `
            <div class="__apexcharts_custom_tooltip" id="top-domain-tooltip">
              <div class="__apexcharts_custom_tooltip_date">${mDate}</div>

              <div class="__apexcharts_custom_tooltip_content">
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: #ff6c40"></span> Hit: <b>${series[0][dataPointIndex]}</b>
                </span>
              </div>
            </div>
          `;
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
        tickAmount: 8,
        tooltip: {
          enabled: false
        }
      },
      grid: {
        borderColor: this.theme === 'white' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)',
      },
    });
    this.topDomainChart.render();
  }

  private drawChartAnomaly() {
    // calculate categories
    this.categoryListFiltered = [];


    if (this.trafficAnomaly?.categories) {
      for (const cat of this.trafficAnomaly.categories) {

        cat.hit = cat.buckets.map(x => x.sum).reduce((x, y) => x + y, 0);
        cat.hit_ratio = Math.floor(cat.hit / (this.trafficAnomaly.total.hit) * 100);
        cat.hit_ratio = cat.hit_ratio || 0;
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

    if (!this.trafficAnomaly.hit && this.trafficChart) {
      this.trafficChart.updateSeries([
        { name: 'Min', type: 'area', data: [] },
        { name: 'Max', type: 'area', data: [] },
        { name: 'Hit', type: 'line', data: [] }
      ]);

      this.trafficChart.updateOptions({
        annotations: {
          points: []
        }
      });

      // this.categoryListFiltered = [];

      return;
    }

    const istatistic = { averages: [], std_deviations: [], hits: [] };

    // calculate chart
    const whichBox = this.selectedBox === 'harmful' || this.selectedBox === 'restricted' ? this.trafficAnomaly['harmful'] || this.trafficAnomaly['restricted'] : this.trafficAnomaly[this.selectedBox];
    const buckets: Bucket[] = this.selectedCategory ? this.trafficAnomaly.categories.find(x => x.name === this.selectedCategory.name)?.buckets : whichBox.buckets;
    istatistic.std_deviations = buckets.map(x => x.std);
    istatistic.averages = buckets.map(x => x.avg);
    istatistic.hits = buckets.map(x => x.sum);

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

    const points = this.getAnnotations(series as any);

    if (this.trafficChart) {
      this.trafficChart.destroy();
      //  this.trafficChart.
      //  return;
    }

    const chartBg = this.theme === 'white' ? '#ffffff' : '#232328';

    this.trafficChart = new ApexCharts(document.querySelector('#chart'), {
      series: series,
      chart: {
        id: 'chart2',
        type: 'line',
        stacked: false,
        group: 'deneme',
        height: 280,
        foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
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
          click: () => {
            console.log('clicked');
          },
          markerClick: () => {

          },
        }
      },
      colors: [chartBg, (this.theme === 'white' ? '#b1dcff' : '#004175'), '#0084ff'],
      stroke: {
        width: 2,
        curve: ['smooth', 'smooth', 'straight']
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
        intersect: false,
        x: {
          show: true
        },
        // fillSeriesColor: true,
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          // const date = new Date(w.globals.seriesX[0][dataPointIndex]);

          const mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');
          // const mDate2 = moment(w.globals.seriesX[0][dataPointIndex]).utc(true).format('MMM DD YYYY - HH:mm');
          // const mDate3 = moment.utc(w.globals.seriesX[0][dataPointIndex]).local().format('MMM DD YYYY - HH:mm');
          return `
            <div class="__apexcharts_custom_tooltip">
              <div class="__apexcharts_custom_tooltip_date">${mDate}</div>

              <div class="__apexcharts_custom_tooltip_content">
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: #507df3"></span> Min: <b>${series[0][dataPointIndex]}</b>
                </span>
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: #c41505"></span> Max: <b>${series[1][dataPointIndex]}</b>
                </span>
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: ${this.theme === 'white' ? '#b5dbff' : '#004175'}"></span> Hit: <b>${series[2][dataPointIndex]}</b>
                </span>

                <p>
                  ${this.translatorService.translate('TooltipDescription')}
                </p>
                </div>
            </div>
          `;
        }
      },
      legend: {
        show: false
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
        },
        lines: {
          show: true
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        min: 0,
        max: yMax + 10,
        tickAmount: 5,
        labels: {
          formatter: (value) => {
            return this.getRoundedNumber(value);
          }
        },
        lines: {
          show: true
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
      },
      grid: {
        borderColor: this.theme === 'white' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
    });

    this.trafficChart.render();
  }

  getAnnotations(data: { name: string, type: string, data: any[][] }) {
    const points = [];

    for (let i = 0; i < data[0].data.length; i++) {
      const min = data[0].data[i][1];
      const max = data[1].data[i][1];
      const hit = data[2].data[i][1];

      const time = data[0].data[i][0];

      const percentMax = (hit - max) / max * 100;

      let color = '';

      if (percentMax >= 100) {
        color = '#c41505';
      } else if (percentMax >= 80) {
        color = '#9c1e6c';
      } else if (percentMax >= 60) {
        color = '#7c26bd';
      } else if (percentMax >= 40) {
        color = '#6158ca';
      } else if (percentMax >= 20) {
        color = '#507df3';
      }

      const elm = {
        x: time,
        y: hit,
        marker: {
          size: percentMax >= 20 ? 3 : 0,
          fillColor: color,
          strokeColor: color,
          strokeSize: percentMax >= 20 ? 3 : 0,
          radius: 2
        }
      };

      points.push(elm);

      points.push(isNaN(percentMax) ? 0 : percentMax);
    }

    return points;
  }

  startDashboardOperations() {
    this.selectedCategory = null;

    /* this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
    }); */

    return this.getTrafficAnomaly({ duration: 7 * 24 });
  }

  private refreshTopDomains() {
    const request = { startDate: this.startDate.toISOString(), endDate: this.endDate.toISOString() } as TopDomainsRequestV5;
    request.type = this.selectedCategory ? this.selectedCategory.name : this.selectedBox;
    return this.getTopDomains(request);
  }

  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '');
    // return Math.abs(value) > 999 ? (Math.sign(value) * (Math.abs(value) / 1000)).toFixed(1) + 'K' : (Math.sign(value) * Math.abs(value)).toFixed(1);
  }

  private getTrafficAnomaly(request: HourlyCompanySummaryV5Request) {

    return this.dashboardService.getHourlyCompanySummary(request).map(result => {
      if (result) {
        this.trafficAnomaly = result;


        if (!this.trafficAnomaly.hit) {

          this.notificationService.warning(this.staticMesssageService.dashboardNoDataFoundMessage);

        }

        this.drawChartAnomaly();
      }

    });



  }

  selectCategory(cat: CategoryV2 | Category) {
    if (cat.name === this.selectedCategory?.name) {

      this.selectedCategory = null;
    } else {

      this.selectedCategory = cat;
    }

    this.drawChartAnomaly();

    this.refreshTopDomains().subscribe();
  }

  flatten(list) {
    return list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
    );
  }

  addDomain(domain: Domain) {
    this.items = [{ display: domain.name, value: domain.name }];

    this.search();
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



    this.dashboardService.getTopDomainValue({ domain: domain, startDate: this.startDate.toISOString(), endDate: this.endDate.toISOString() }).subscribe(result => {


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

    /*  if (this.getDetailButtonDisabled) {
       this.notificationService.warning(this.translatorService.translate('DateDifferenceWarning'));
     } else { */
    const url = (`/admin/reports/monitor?category=${this.selectedCategory?.name || this.selectedBox}&startDate=${moment(this.startDate).toISOString()}&endDate=${moment(this.endDate).toISOString()}`);

    this.router.navigateByUrl(url);
    // }
  }



  convertTimeString(num: number) {
    const month = Math.floor(num / (1440 * 30));
    const w = Math.floor((num - (month * 1440 * 30)) / (1440 * 7));
    const d = Math.floor((num - (w * 1440 * 7)) / 1440); // 60*24
    const h = Math.floor((num - (d * 1440)) / 60);
    const m = Math.round(num % 60);

    let text = '';

    if (month > 0) {
      text = `${month} ${this.translatorService.translate('Month')}`;

      if (w > 0) {
        text += ` ${w} ${this.translatorService.translate('Week')}`;
      }
    } else if (w > 0) {
      text = `${w} ${this.translatorService.translate('Week')}`;

      if (d > 0) {
        text += ` ${d} ${this.translatorService.translate('Day')}`;
      }
    } else if (d > 0) {
      text = `${d} ${this.translatorService.translate('Day')}`;

      if (h > 0) {
        text += ` ${h} ${this.translatorService.translate('Hour')}`;
      }
    } else if (h > 0) {
      text = `${h} ${this.translatorService.translate('Hour')}`;

      if (m > 0) {
        text += ` ${m} ${this.translatorService.translate('Minute')}`;
      }
    } else {
      text = `${m} ${this.translatorService.translate('Minute')}`;
    }

    return text;
  }


}
