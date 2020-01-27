import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashBoardService } from 'src/app/core/services/DashBoardService';
import { ElasticDashboardResponse } from 'src/app/core/models/ElasticDashboardResponse';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { DashboardStats } from 'src/app/core/models/DashboardStats';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/core/services/agent.service';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';
import { BoxService } from 'src/app/core/services/box.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { DataPanelModel, DateParamModel } from 'src/app/core/models/Dashboard';
import { KeyValueModel, TimeRangeEnum } from 'src/app/core/models/Utility';
import { RkApexHelper } from 'roksit-lib';

declare let $: any;
declare let moment: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  host: ConfigHost;
  elasticData: ElasticDashboardResponse[];
  dateParameter = 0;
  ds: DashboardStats = new DashboardStats();
  searchKey: string;
  labelArray: string[] = [];
  categoryList = [];
  categoryListFiltered = [];
  selectedCategoryForTraffic = CategoryV2;
  selectedCategoryForUnique = CategoryV2;
  trafficChart: any;
  uniqueDomainChart: any;
  trafficChartType = 'hit';
  uniqueChartType = 'domain';

  dataPanels: DataPanelModel[] = [];
  timeRangeButtons: DateParamModel[] = [];

  constructor(private dashboardService: DashBoardService, private authService: AuthenticationService,
    private staticService: StaticService, private notification: NotificationService, private router: Router,
    private agentService: AgentService, private customReportService: CustomReportService, private config: ConfigService,
    private boxService: BoxService, private roamingService: RoamingService) { }

  ngOnInit() {
    this.host = this.config.host;
    const roleName: string = this.authService.currentSession.currentUser.roles.name;

    this.prepareTimeline();

    if (roleName != 'ROLE_USER') {
      this.agentService.getAgents().subscribe(res => {
        if (res == null || res.length < 1) {
          this.boxService.getBoxes().subscribe(res2 => {
            if (res2 == null || res2.length < 1) {
              this.roamingService.getClients().subscribe(res3 => {
                if (res3 == null || res3.length < 1) {
                  // TODO: redericeting temporarily
                  this.router.navigateByUrl('/admin/publicip');
                  // this.openModal();
                } else {
                  this.startDashboardOperations();
                }
              });
            } else {
              this.startDashboardOperations();
            }
          });
        } else {
          this.startDashboardOperations();
        }
      });
    } else {
      this.startDashboardOperations();
    }


    this.dataPanels.push({ name: 'Public IP', activeCount: 8, passiveCount: 3 });
    this.dataPanels.push({ name: 'Roming Client', activeCount: 6, passiveCount: 4 });
    this.dataPanels.push({ name: 'DNS Relay', activeCount: 12, passiveCount: 5 });
  }

  ngAfterViewInit(): void {
    // introJs().start();
  }

  private prepareTimeline() {
    function generateDayWiseTimeSeries(baseval, count, yrange) {
      let i = 0;
      const series = [];
      while (i < count) {
        const x = baseval;
        const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

        series.push([x, y]);
        baseval += 86400000;
        i++;
      }
      return series;
    }

    const data = generateDayWiseTimeSeries(new Date('11 Feb 2017').getTime(), 185, {
      min: 10,
      max: 500
    });

    RkApexHelper.render('#chart', {
      series: [{
        data
      }],
      chart: {
        id: 'chart2',
        type: 'line',
        height: 350,
        toolbar: {
          autoSelected: 'pan',
          show: false
        }
      },
      markers: {
        size: 4,
        colors: ['#FFA41B'],
        strokeColors: '#FFA41B',
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      colors: ['#0084ff'],
      stroke: {
        width: 3
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

    RkApexHelper.render('#timeline', {
      series: [{
        data
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
          xaxis: {
            min: new Date('19 Jun 2017').getTime(),
            max: new Date('14 Aug 2017').getTime()
          },
        }
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
  }

  startDashboardOperations() {
    this.selectedCategoryForTraffic = null;
    this.selectedCategoryForUnique = null;
    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
      this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => a.name > b.name ? 1 : -1))); // deep copy
    });

    this.elasticData = [];
    this.ds = new DashboardStats();
    this.changeDateParameter(6);
  }

  prepareWorldMap(time: string) {
    const values: Map<string, number> = new Map();
    const searchSetting = new SearchSetting();
    const col: LogColumn = { name: 'destinationIpCountryCode', beautyName: 'Dst.Country', hrType: 'COUNTRY_FLAG', aggsType: 'TERM', checked: true };
    const item = new AggregationItem(col, col.beautyName);
    searchSetting.columns.columns.push(item);
    searchSetting.topNumber = 250;
    searchSetting.dateInterval = '5';

    if (time == '0') {
      const d = new Date();
      searchSetting.dateInterval = ((d.getHours() * 60) + d.getMinutes()).toString();
    } else if (time == '-1') {
      searchSetting.dateInterval = '60';
    } else if (time == '1' || time == '2' || time == '3' || time == '6' || time == '7') {
      const d1 = new Date();
      const d2 = new Date();
      d1.setDate(d1.getDate() - Number(time));
      const startDate = moment(new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0), 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
      const endDate = moment(new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 23, 59, 59), 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
      const dateVal = startDate + ' - ' + endDate;
      searchSetting.dateInterval = dateVal;
    } else {
      searchSetting.dateInterval = time;
    }

    this.customReportService.getData(searchSetting).subscribe(res => {
      if (res instanceof Array) {
        for (let i = 0; i < res.length; i++) {
          values.set(res[i][0].toLowerCase(), Number(res[i][1]));
        }

        let max = 0, min = Number.MAX_VALUE, startColor = [200, 238, 255], endColor = [0, 100, 145], colors = <any>{}, hex;

        values.forEach((value: number, key: string) => {
          if (value > max) { max = value; }
          if (value < min) { min = value; }
        });

        values.forEach((value: number, key: string) => {
          if (value > 0) {
            colors[key] = '#';
            for (let i = 0; i < 3; i++) {
              hex = Math.round(startColor[i] + (endColor[i] - startColor[i]) * (value == max ? 1 : (value / (max - min)))).toString(16);
              if (hex.length == 1) { hex = '0' + hex; }
              colors[key] += (hex.length == 1 ? '0' : '') + hex;
            }
          }
        });

        $('#worldMap').vectorMap({
          map: 'world_en',
          backgroundColor: 'transparent',
          borderColor: '#818181',
          borderOpacity: 0.25,
          borderWidth: 1,
          color: '#f4f3f0',
          enableZoom: true,
          hoverColor: '#c9dfaf',
          showTooltip: true,
          colors: colors,
          series: {
            regions: [{
              values: values,
              scale: ['#C8EEFF', '#0071A4'],
              normalizeFunction: 'polynomial'
            }]
          },
          onRegionOver: (event, code, region) => {
            event.preventDefault();
          },
          onRegionClick: (element, code, region) => {
            const elements = $('.jqvmap-label');
            if (elements && elements.length > 0) {
              for (let i = 0; i < elements.length; i++) {
                const e = elements[i];
                e.style.display = 'none'
              }
            }
            this.showInReport('map' + code);
          },
          onLabelShow: (event, label, code) => {
            label[0].innerText = label[0].innerText + ' : ' + (values.has(code) ? values.get(code) : 0);
          }
        });
      }
    });

  }

  private getElasticData(d1: string, d2: string) {
    this.dashboardService.getHourlyCompanySummary(d1, d2).subscribe(res => {
      this.elasticData = res;
      this.elasticData.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
      this.createCharts();
    });
  }

  createCharts() {
    this.ds = new DashboardStats();
    let sRCounter = 0, mTotalAverages = 0, uSRCounter = 0, uSRAverages = 0, grayCounter = 0, grayTotalAverages = 0,
      uGrayCounter = 0, uGrayCounterAverages = 0;
    this.labelArray = [];
    const indexLimit = this.dateParameter == -1 ? this.elasticData.length - 1 : 0;

    for (let i = indexLimit; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];
      this.labelArray.push(moment(data.date).format('YYYY-MM-DDTHH:mm:ss.sssZ'));
      this.ds.totalHitCountForDashboard += data.total_hit;
      this.ds.totalBlockCountForDashboard += data.blocked_count;
      this.ds.totalAllowedCountForDashboard += data.allowed_count;
      this.ds.totalUniqueBlockedDomainForDashboard += data.unique_blocked_domain;
      this.ds.uniqueBlockedDomain.push(Math.round(data.averages.unique_blocked_domain));
      this.ds.totalUniqueDomain += data.unique_domain;
      this.ds.hitAverages.push(Math.round(data.averages.total_hit));
      this.ds.totalHits.push(data.total_hit);
      this.ds.blockAverages.push(Math.round(data.averages.blocked_count));
      this.ds.totalBlocks.push(data.blocked_count);
      this.ds.uniqueDomain.push(data.unique_domain);
      this.ds.uniqueDomainAvg.push(Math.round(data.averages.unique_domain));
      this.ds.uniqueDesIp.push(data.unique_destip);
      this.ds.uniqueDesIpAvg.push(Math.round(data.averages.unique_destip));
      this.ds.uniqueSubdomain.push(data.unique_subdomain);
      this.ds.uniqueSubdomainAvg.push(Math.round(data.averages.unique_subdomain));

      Object.keys(data.category_hits).forEach(function eachKey(key) {
        if (key.toString() == 'Malware/Virus' || key.toString() == 'Potentially Dangerous' || key.toString() == 'Phishing') {
          sRCounter += data.category_hits[key].hits;
          mTotalAverages += data.category_hits[key].average;

          uSRCounter += data.category_hits[key].unique_domain;
          uSRAverages += data.category_hits[key].unique_domain_average;

        } else if (key.toString() == 'Unknown' || key.toString() == 'Undecided Not Safe' || key.toString() == 'Undecided Safe'
          || key.toString() == 'Domain Parking' || key.toString() == 'Newly Register' || key.toString() == 'Newly Up'
          || key.toString() == 'Dead Sites' || key.toString() == 'Firstly Seen') {
          grayCounter += data.category_hits[key].hits;
          grayTotalAverages += data.category_hits[key].average;

          uGrayCounter += data.category_hits[key].unique_domain;
          uGrayCounterAverages += data.category_hits[key].unique_domain_average;
        }
      });

      this.ds.securityRiskCountForDashboard = sRCounter;
      this.ds.uSecurityRiskCountForDashboard = uSRCounter;
      this.ds.grayCountForDashboard = grayCounter;
      this.ds.uGrayCountForDashboard = uGrayCounter;
    }

    this.ds.riskScore = 0;
    if (this.ds.totalHitCountForDashboard && this.ds.totalHitCountForDashboard > 0) {
      this.ds.riskScore = Math.round(100 * ((2 * this.ds.uSecurityRiskCountForDashboard) + this.ds.uGrayCountForDashboard) / this.ds.totalUniqueDomain);
    }

    if (this.elasticData && this.elasticData.length > 0) {
      this.ds.totalHitCountForDashboardDelta = this.calculatePercentage(this.ds.hitAverages.reduce((a, b) => a + b), this.ds.totalHitCountForDashboard);
      this.ds.totalBlockCountForDashboardDelta = this.calculatePercentage(this.ds.blockAverages.reduce((a, b) => a + b), this.ds.totalBlockCountForDashboard);
      this.ds.totalUniqueBlockedDomainForDashboardDelta = this.calculatePercentage(this.ds.uniqueBlockedDomain.reduce((a, b) => a + b), this.ds.totalUniqueBlockedDomainForDashboard);
      this.ds.totalUniqueDomainDelta = this.calculatePercentage(this.ds.uniqueDomainAvg.reduce((a, b) => a + b), this.ds.totalUniqueDomain);
      this.ds.securityRiskCountForDashboardDelta = this.calculatePercentage(mTotalAverages, this.ds.securityRiskCountForDashboard);
      this.ds.uSecurityRiskCountForDashboardDelta = this.calculatePercentage(uSRAverages, this.ds.uSecurityRiskCountForDashboard);
      this.ds.grayCountForDashboardDelta = this.calculatePercentage(grayTotalAverages, this.ds.grayCountForDashboard);
      this.ds.uGrayCountForDashboardDelta = this.calculatePercentage(uGrayCounterAverages, this.ds.uGrayCountForDashboard);
    } else {
      this.notification.warning('There is no dashboard data!', false);
    }

    // Total Traffic Chart
    let trafficChartoptions = {
      chart: {
        height: 310, type: 'line', foreColor: '#9b9b9b',
        toolbar: { tools: { download: false, pan: false } },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            this.updateCharts(xaxis.min, xaxis.max);
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth' },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { type: 'datetime', categories: this.labelArray, tickAmount: 1, style: { color: '#f0f0f0' } },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
      tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' }, theme: 'dark' }
    };
    this.trafficChart = new ApexCharts(document.querySelector('#trafficChartHits'), trafficChartoptions);
    this.trafficChart.render();
    this.trafficChart.updateSeries([{ name: 'Today Hits', data: this.ds.totalHits }, { name: ' Total Hit Averages', data: this.ds.hitAverages }]);

    // Uniquer Domain Chart
    let uniqueDomainOptions = {
      chart: {
        height: 280, type: 'line', foreColor: '#9b9b9b',
        toolbar: { tools: { download: false, pan: false } },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            this.updateCharts(xaxis.min, xaxis.max);
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { type: 'datetime', categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' }, theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    };
    this.uniqueDomainChart = new ApexCharts(document.querySelector('#uniqueDomainChart'), uniqueDomainOptions);
    this.uniqueDomainChart.render();
    this.uniqueDomainChart.updateSeries([{ name: 'Unique Domain', data: this.ds.uniqueDomain }, { name: 'Unique Domain Avg', data: this.ds.uniqueDomainAvg }]);

    // Unique Subdomain Chart
    let uniqueSubdomainChartOptions = {
      chart: {
        height: 280, type: 'line', foreColor: '#9b9b9b',
        toolbar: { tools: { download: false, pan: false } },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            this.updateCharts(xaxis.min, xaxis.max);
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { type: 'datetime', categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' }, theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    };
    let uniqueSubdomainChart = new ApexCharts(document.querySelector('#uniqueSubdomainChart'), uniqueSubdomainChartOptions);
    uniqueSubdomainChart.render();
    uniqueSubdomainChart.updateSeries([{ name: 'Unique Subdomain', data: this.ds.uniqueSubdomain }, { name: 'Unique Subdomain Avg', data: this.ds.uniqueSubdomainAvg }]);

    // Unique Dest Ip Chart
    let uniqueDestIpChartOptions = {
      chart: {
        height: 280, type: 'line', foreColor: '#9b9b9b',
        toolbar: { tools: { download: false, pan: false } },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            this.updateCharts(xaxis.min, xaxis.max);
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { type: 'datetime', categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' }, theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    };
    let uniqueDestIpChart = new ApexCharts(document.querySelector('#uniqueDestIpChart'), uniqueDestIpChartOptions);
    uniqueDestIpChart.render();
    uniqueDestIpChart.updateSeries([{ name: 'Unique Dest. Ip', data: this.ds.uniqueDesIp }, { name: 'Unique Dest. Ip Avg', data: this.ds.uniqueDesIpAvg }]);

    // GAUGE Chart
    let gaugeOptions = {
      chart: { height: 250, type: 'radialBar', },
      plotOptions: {
        radialBar: {
          startAngle: -100, endAngle: 100,
          dataLabels: {
            name: { fontSize: '16px', color: '#e4e4e4', offsetY: 25 },
            value: { offsetY: -20, fontSize: '22px', color: '#fffefe' }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#ffe20b'],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      colors: ['#fa1e1e'],
      series: [{ data: 1 }],
      labels: ['Risk Score'],

    };
    let gaugeChart = new ApexCharts(document.querySelector('#gaugeChart'), gaugeOptions);
    gaugeChart.render();
    gaugeChart.updateSeries([this.ds.riskScore]);
  }

  changeDateParameter(param: number) {
    this.dateParameter = param;
    if (param == -1) {
      param = 0;
    }
    const today = new Date();
    let d1 = new Date();
    d1.setDate(d1.getDate() - param);
    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0);
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    this.getElasticData(d1.toISOString(), d2.toISOString());
    this.prepareWorldMap(this.dateParameter.toString());
  }

  updateCharts(min: any, max: any) {
    if (min && max) {
      const mn = new Date(min);
      const mx = new Date(max);
      this.getElasticData(mn.toISOString(), mx.toISOString());

      const startDate = moment(mn).format('DD.MM.YYYY HH:mm:ss');
      const endDate = moment(mx).format('DD.MM.YYYY HH:mm:ss');
      const time = startDate + ' - ' + endDate;
      this.prepareWorldMap(time);
    } else {
      this.changeDateParameter(0);
    }

  }

  calculatePercentage(num1: number, num2: number) {
    return Math.round((num2 - num1) / num1 * 100);
  }

  changeTrafficChartData(type: string) {
    this.trafficChartType = type;
    if (type == 'hit') {
      $('#hitChartDiv').show();
      $('#blockChartDiv').hide();
    } else {
      $('#hitChartDiv').hide();
      $('#blockChartDiv').show();
    }

  }

  changeUniqueChartData(type: string) {
    this.uniqueChartType = type;
    if (type == 'domain') {
      $('#uniqueDomainChartDiv').show();
      $('#uniqueSubdomainChartDiv').hide();
      $('#uniqueDestIpChartDiv').hide();
    } else if (type == 'subdomain') {
      $('#uniqueDomainChartDiv').hide();
      $('#uniqueSubdomainChartDiv').show();
      $('#uniqueDestIpChartDiv').hide();
    } else {
      $('#uniqueDomainChartDiv').hide();
      $('#uniqueSubdomainChartDiv').hide();
      $('#uniqueDestIpChartDiv').show();
    }

  }

  searchCategoryForTraffic(val: any) {
    this.categoryListFiltered = this.categoryList.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
  }

  addCategoryToTraffic(id: number) {
    this.selectedCategoryForTraffic = this.categoryList.find(c => c.id == id);
    const catName = this.selectedCategoryForTraffic.name;

    const catHits = [], catAvs = [];
    const indexLimit = this.dateParameter == -1 ? this.elasticData.length - 1 : 0;
    for (let i = indexLimit; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];

      Object.keys(data.category_hits).forEach(function eachKey(key) {
        if (key.toString() == catName) {
          catHits.push(data.category_hits[key].hits);
          catAvs.push(Math.round(data.category_hits[key].average));

        }
      });
    }

    this.trafficChart.updateSeries([{ name: catName + ' Hits', data: catHits }, { name: 'Average Hits', data: catAvs }]);

    this.resetCategoryListFiltered();
  }

  deleteCatFromTraffic(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForTraffic = null;
      this.trafficChart.updateSeries([{ name: 'Today Hits', data: this.ds.totalHits }, { name: 'Average Hits', data: this.ds.hitAverages }]);
    }
  }

  addCategoryToUnique(id: number) {
    this.selectedCategoryForUnique = this.categoryList.find(c => c.id == id);
    const catName = this.selectedCategoryForUnique.name;
    const catHits = [], catAvs = [];
    const indexLimit = this.dateParameter == -1 ? this.elasticData.length - 1 : 0;
    for (let i = indexLimit; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];

      Object.keys(data.category_hits).forEach(function eachKey(key) {
        if (key.toString() == catName) {
          catHits.push(data.category_hits[key].unique_domain);
          catAvs.push(Math.round(data.category_hits[key].unique_domain_average));

        }
      });
    }

    this.uniqueDomainChart.updateSeries([{ name: catName + 'Unique Domain', data: catHits }, { name: 'Unique Domain Avg', data: catAvs }]);

    this.resetCategoryListFiltered();
  }

  deleteCatFromUnique(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForUnique = null;
      this.uniqueDomainChart.updateSeries([{ name: 'Unique Domain', data: this.ds.uniqueDomain }, { name: 'Unique Domain Avg', data: this.ds.uniqueDomainAvg }]);
    }

  }

  private resetCategoryListFiltered() {
    this.searchKey = null;
    this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => a.name > b.name ? 1 : -1))); // deep copy
  }

  showInReport(param: string) {
    localStorage.setItem('dashboardParam', param + '&' + this.dateParameter);
    this.router.navigate(['/admin/reports/customreport']);
  }

  openModal() {
    $(document.body).addClass('modal-open');
    $('#exampleModal').css('display', 'block');
    $('#exampleModal').attr('aria-hidden', 'false');
    $('#exampleModal').addClass('show');
  }

  closeModal() {
    $(document.body).removeClass('modal-open');
    $('#exampleModal').css('display', 'none');
    $('#exampleModal').attr('aria-hidden', 'true');
    $('#exampleModal').removeClass('show');
  }
}
