import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { DashBoardService } from 'src/app/core/services/DashBoardService';
import { ElasticDashboardResponse } from 'src/app/core/models/ElasticDashboardResponse';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DatePipe } from '@angular/common';
import { StaticService } from 'src/app/core/services/StaticService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js'
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { DashboardStats } from 'src/app/core/models/DashboardStats';
import { NotificationService } from 'src/app/core/services/notification.service';
import * as introJs from 'intro.js/intro.js';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/core/services/agent.service';
import { MonitorService } from 'src/app/core/services/MonitorService';
import { SearchSetting } from 'src/app/core/models/SearchSetting';

declare let $: any;
declare let moment: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  elasticData: ElasticDashboardResponse[];
  dateParameter: number = 0;
  ds: DashboardStats = new DashboardStats();
  searchKey: string;
  public labelArray = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];

  categoryList = [];
  categoryListFiltered = [];
  selectedCategoryForTraffic = CategoryV2;
  selectedCategoryForUnique = CategoryV2;
  trafficChart: any;
  uniqueDomainChart: any;
  trafficChartType: string = 'hit';
  uniqueChartType: string = 'domain';

  constructor(private dashboardService: DashBoardService, private datePipe: DatePipe, private authService: AuthenticationService,
    private staticService: StaticService, private notification: NotificationService, private router: Router,
    private agentService: AgentService) {

    let roleName: string = this.authService.currentSession.currentUser.roles.name;
    //agent yoksa public ip sayfasına yönlendir
    this.agentService.getAgents().subscribe(res => {

      if ((res == null || res.length < 1) && roleName != 'ROLE_USER') {// if there is no agent and role is not user redirect
        this.router.navigateByUrl('/admin/publicip');
      } else {
        this.selectedCategoryForTraffic = null;
        this.selectedCategoryForUnique = null;

        this.staticService.getCategoryList().subscribe(res => {
          this.categoryList = res;
          this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => { return a.name > b.name ? 1 : -1; })));//deep copy
        });

        this.elasticData = [];
        this.ds = new DashboardStats();

        this.getElasticData(Date.now());
      }
    });

    //this.prepareWorldMap();
  }

  ngOnInit(): void {
    this.prepareWorldMap();
  }

  ngAfterViewInit(): void {
    // introJs().start();
  }

  prepareWorldMap() {
    let values: Map<string, number> = new Map();
    values.set('ru', 234);
    values.set('ca', 154);
    values.set('us', 834);
    values.set('br', 128);
    values.set('tr', 500);
    values.set('fr', 400);
    values.set('it', 200);
    values.set('au', 320);
    values.set('bg', 340);
    values.set('cn', 340);
    values.set('cd', 240);
    values.set('de', 740);
    values.set('bi', 340);

    $('#worldMap').vectorMap({
      map: 'world_en',
      backgroundColor: 'transparent',
      borderColor: '#818181',
      borderOpacity: 0.9,
      borderWidth: 1,
      color: '#b3b3b3',
      enableZoom: true,
      zoomButtons: true,
      zoomMin: 1, zoomMax: 8, zoomStep: 1.6,
      hoverColor: '#eee',
      scaleColors: ['#b6d6ff', '#005ace'],
      selectedColor: '#c9dfaf',
      selectedRegions: false,
      showTooltip: false,
      series: {
        regions: [{
          values: values,
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionOver: function (e, code, region) {
      },
      onRegionClick: function (e, code, region) {
        e.preventDefault();
        var message = region + ' : value:' + values.get(code);
      }
    });

    window.setTimeout(function () {
      values.forEach((value: number, key: string) => {
        var element = document.getElementById('jqvmap1_' + key);

        if (element) {
          if (value < 300) {
            element.setAttribute('fill', '#6c84fa');
          } else {
            element.setAttribute('fill', '#4c546a');
          }
          element.title = value.toString();
        }
      });

    }, 1000);
  }

  private getElasticData(d: number) {
    //let today = new Date(); todayi d2 ye atayıp aradaki farkı getirecek şekilde dönüştür.
    const date = new Date(d);

    let d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    let d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    //Below code gets map data
    // let ss = new SearchSetting();
    // let startDate = d1 == null ? '' : moment(d1, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
    // let endDate = d2 == null ? '' : moment(d2, 'DD.MM.YYYY HH:mm:ss', true).format('DD.MM.YYYY HH:mm:ss');
    // const dateVal = startDate + ' - ' + endDate;
    // ss.dateInterval = dateVal;

    // bu metotta paging var ülkelere göre group by yapıp count donecek yeni api lazım
    // this.monitorService.getGraphData(ss, 0).subscribe((res: Response) => {
    //   let tableData = res['result'];
    //   console.log(res);

    //   console.log(tableData);
    // });


    this.dashboardService.getHourlyCompanySummary(d1.toISOString(), d2.toISOString()).subscribe(res => {
      this.elasticData = res;
      this.elasticData.forEach(d => { d.hourIndex = new Date(d.time_range.gte).getHours(); });
      this.elasticData.sort((x, y) => { return x.hourIndex - y.hourIndex; });
      this.createCharts();
    });
  }

  changeDateParameter(param: number) {
    this.dateParameter = param;
    if (param == -1) {
      param = 0;
    }
    let today = new Date();

    this.getElasticData(new Date().setDate(today.getDate() - param));
  }

  createCharts() {
    this.ds = new DashboardStats();
    let sRCounter = 0, mTotalAverages = 0, uSRCounter = 0, uSRAverages = 0, grayCounter = 0, grayTotalAverages = 0,
      uGrayCounter = 0, uGrayCounterAverages = 0;

    const indexLimit = this.dateParameter == -1 ? this.elasticData.length - 1 : 0;

    for (let i = indexLimit; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];
      this.ds.totalHitCountForDashboard += data.total_hit;
      this.ds.totalBlockCountForDashboard += data.blocked_count;
      this.ds.totalUniqueBlockedDomainForDashboard += data.unique_blocked_domain;
      this.ds.uniqueBlockedDomain.push(Math.round(data.averages.unique_blocked_domain));
      this.ds.totalUniqueDomain += data.unique_domain;
      this.ds.hitAverages.push(Math.round(data.averages.total_hit));
      this.ds.totalHits.push(data.total_hit);
      this.ds.blockAverages.push(Math.round(data.averages.blocked_count));
      this.ds.totalBlocks.push(data.blocked_count);
      this.ds.uniqueDomain.push(data.unique_domain);
      this.ds.uniqueDomainAvg.push(Math.round(data.averages.unique_domain))
      this.ds.uniqueDesIp.push(data.unique_destip)
      this.ds.uniqueDesIpAvg.push(Math.round(data.averages.unique_destip))
      this.ds.uniqueSubdomain.push(data.unique_subdomain)
      this.ds.uniqueSubdomainAvg.push(Math.round(data.averages.unique_subdomain))

      Object.keys(data.category_hits).forEach(function eachKey(key) {
        if (key.toString() == 'Malware/Virus' || key.toString() == 'Potentially Dangerous' || key.toString() == 'Phishing') {
          sRCounter += data.category_hits[key].hits;
          mTotalAverages += data.category_hits[key].average;

          uSRCounter += data.category_hits[key].unique_domain;
          uSRAverages += data.category_hits[key].unique_domain_average

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
    var trafficChartoptions = {
      chart: {
        height: 310, type: 'line', zoom: { enabled: false },
        foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } },
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 6] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
      tooltip: { theme: 'dark' }
    }
    this.trafficChart = new ApexCharts(document.querySelector("#trafficChartHits"), trafficChartoptions);
    this.trafficChart.render();
    this.trafficChart.updateSeries([{ name: "Today Hits", data: this.ds.totalHits }, { name: " Total Hit Averages", data: this.ds.hitAverages }])

    //Uniquer Domain Chart
    var uniqueDomainOptions = {
      chart: { height: 280, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    }
    this.uniqueDomainChart = new ApexCharts(document.querySelector("#uniqueDomainChart"), uniqueDomainOptions);
    this.uniqueDomainChart.render();
    this.uniqueDomainChart.updateSeries([{ name: "Unique Domain", data: this.ds.uniqueDomain }, { name: "Unique Domain Avg", data: this.ds.uniqueDomainAvg }]);

    //Unique Subdomain Chart
    var uniqueSubdomainChartOptions = {
      chart: { height: 280, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    }
    var uniqueSubdomainChart = new ApexCharts(document.querySelector("#uniqueSubdomainChart"), uniqueSubdomainChartOptions);
    uniqueSubdomainChart.render();
    uniqueSubdomainChart.updateSeries([{ name: "Unique Subdomain", data: this.ds.uniqueSubdomain }, { name: "Unique Subdomain Avg", data: this.ds.uniqueSubdomainAvg }])

    // Unique Dest Ip Chart
    var uniqueDestIpChartOptions = {
      chart: { height: 280, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ data: [1] }, { data: [1] }],
      markers: { size: 2, strokeColor: ['#9d60fb', '#4a90e2'], hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'center', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    }
    var uniqueDestIpChart = new ApexCharts(document.querySelector("#uniqueDestIpChart"), uniqueDestIpChartOptions);
    uniqueDestIpChart.render();
    uniqueDestIpChart.updateSeries([{ name: "Unique Dest. Ip", data: this.ds.uniqueDesIp }, { name: "Unique Dest. Ip Avg", data: this.ds.uniqueDesIpAvg }])

    // GAUGE Chart
    var gaugeOptions = {
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

    }
    var gaugeChart = new ApexCharts(document.querySelector("#gaugeChart"), gaugeOptions);
    gaugeChart.render();
    gaugeChart.updateSeries([this.ds.riskScore])

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
    let catName = this.selectedCategoryForTraffic.name;

    let catHits = [], catAvs = []
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

    this.trafficChart.updateSeries([{ name: catName + " Hits", data: catHits }, { name: "Average Hits", data: catAvs }])

    this.resetCategoryListFiltered();
  }

  deleteCatFromTraffic(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForTraffic = null;
      this.trafficChart.updateSeries([{ name: "Today Hits", data: this.ds.totalHits }, { name: "Average Hits", data: this.ds.hitAverages }])
    }
  }

  addCategoryToUnique(id: number) {
    this.selectedCategoryForUnique = this.categoryList.find(c => c.id == id);
    let catName = this.selectedCategoryForUnique.name;
    let catHits = [], catAvs = []
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

    this.uniqueDomainChart.updateSeries([{ name: catName + "Unique Domain", data: catHits }, { name: "Unique Domain Avg", data: catAvs }]);

    this.resetCategoryListFiltered();
  }

  deleteCatFromUnique(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForUnique = null;
      this.uniqueDomainChart.updateSeries([{ name: "Unique Domain", data: this.ds.uniqueDomain }, { name: "Unique Domain Avg", data: this.ds.uniqueDomainAvg }]);
    }

  }

  private resetCategoryListFiltered() {
    this.searchKey = null;
    this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => { return a.name > b.name ? 1 : -1; })));//deep copy
  }

  showInReport(param: string) {
    if (param == 'securityRisk') {
      localStorage.setItem('dashboardParam', param + '&' + this.dateParameter)
    } else if (param == 'gray') {
      localStorage.setItem('dashboardParam', param + '&' + this.dateParameter)
    } 
    this.router.navigate(['/admin/reports/customreport']);
  }
}
