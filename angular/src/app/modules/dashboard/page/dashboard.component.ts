import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import * as Chartist from 'chartist';
import { TableData } from '../../shared/md/md-table/md-table.component';
import { DashBoardService } from 'src/app/core/services/DashBoardService';
import { ElasticDashboardResponse } from 'src/app/core/models/ElasticDashboardResponse';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DatePipe } from '@angular/common';
import { StaticService } from 'src/app/core/services/StaticService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js'
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { DashboardStats } from 'src/app/core/models/DashboardStats';
import { NotificationService } from 'src/app/core/services/notification.service';

declare const $: any;

//chartlar icin class tanımla
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
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
  companyId: number;

  constructor(private dashboardService: DashBoardService, private auth: AuthenticationService, private datePipe: DatePipe,
    private staticService: StaticService, private notification: NotificationService) {

    this.selectedCategoryForTraffic = null;
    this.selectedCategoryForUnique = null;

    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
      this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList.sort((a, b) => { return a.name > b.name ? 1 : -1; })));//deep copy
    });

    this.elasticData = [];
    this.ds = new DashboardStats();

    this.auth.getCurrentUser().subscribe(cu => {
      this.companyId = cu.currentUser.companyId;
      this.getElasticData(Date.now());
    });
  }

  ngOnInit(): void {

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
      borderOpacity: 0.25,
      borderWidth: 1,
      color: '#b3b3b3',
      enableZoom: true,
      hoverColor: '#eee',
      hoverOpacity: null,
      normalizeFunction: 'linear',
      scaleColors: ['#b6d6ff', '#005ace'],
      selectedColor: '#c9dfaf',
      selectedRegions: null,
      showTooltip: false,
      onRegionClick: function (element, code, region) {

        // var message = 'You clicked "'
        //   + region
        //   + '" which has the code: '
        // + code.toUpperCase() + ' value:' + values.get(code);

        //alert(message);
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

  private getElasticData(date: number) {
    this.dashboardService.getHourlyCompanySummary(this.companyId.toString(), this.datePipe.transform(date, 'yyyy-MM-dd')).subscribe(res => {
      this.elasticData = res;
      
      console.log(res);      

      this.elasticData.forEach(d => { d.hourIndex = new Date(d.time_range.gte).getHours(); });
      this.elasticData.sort((x, y) => { return x.hourIndex - y.hourIndex; });
      this.createCharts();
    });
  }

  changeDateParameter(param: number) {
    var today = new Date();
    this.dateParameter = param;
    this.getElasticData(new Date().setDate(today.getDate() - param));
  }

  createCharts() {
    this.ds = new DashboardStats();
    let mCounter = 0, mTotalAverages = 0, uMCounter = 0, uMAverages = 0, grayCounter = 0, grayTotalAverages = 0,
      uGrayCounter = 0, uGrayCounterAverages = 0;

    for (let i = 0; i < this.elasticData.length; i++) {
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
          mCounter += data.category_hits[key].hits;
          mTotalAverages += data.category_hits[key].average;

          uMCounter += data.category_hits[key].unique_domain;
          uMAverages += data.category_hits[key].unique_domain_average

        } else if (key.toString() == 'Unknown' || key.toString() == 'Undecided Not Safe' || key.toString() == 'Undecided Safe'
          || key.toString() == 'Domain Parking' || key.toString() == 'Newly Register' || key.toString() == 'Newly Up'
          || key.toString() == 'Dead Sites' || key.toString() == 'Firstly Seen') {
          grayCounter += data.category_hits[key].hits;
          grayTotalAverages += data.category_hits[key].average;

          uGrayCounter += data.category_hits[key].unique_domain;
          uGrayCounterAverages += data.category_hits[key].unique_domain_average;
        }
      });

      this.ds.malwareCountForDashboard = mCounter;
      this.ds.uMalwareCountForDashboard = uMCounter;
      this.ds.grayCountForDashboard = grayCounter;
      this.ds.uGrayCountForDashboard = uGrayCounter;
    }

    this.ds.riskScore = 47;//Math.round(this.ds.totalBlockCountForDashboard / this.ds.totalHitCountForDashboard);

    if (this.elasticData && this.elasticData.length > 0) {
      this.ds.totalHitCountForDashboardDelta = this.calculatePercentage(this.ds.hitAverages.reduce((a, b) => a + b), this.ds.totalHitCountForDashboard);
      this.ds.totalBlockCountForDashboardDelta = this.calculatePercentage(this.ds.blockAverages.reduce((a, b) => a + b), this.ds.totalBlockCountForDashboard);
      this.ds.totalUniqueBlockedDomainForDashboardDelta = this.calculatePercentage(this.ds.uniqueBlockedDomain.reduce((a, b) => a + b), this.ds.totalUniqueBlockedDomainForDashboard);
      this.ds.totalUniqueDomainDelta = this.calculatePercentage(this.ds.uniqueDomainAvg.reduce((a, b) => a + b), this.ds.totalUniqueDomain);
      this.ds.malwareCountForDashboardDelta = this.calculatePercentage(mTotalAverages, this.ds.malwareCountForDashboard);
      this.ds.uMalwareCountForDashboardDelta = this.calculatePercentage(uMAverages, this.ds.uMalwareCountForDashboard);
      this.ds.grayCountForDashboardDelta = this.calculatePercentage(grayTotalAverages, this.ds.grayCountForDashboard);
      this.ds.uGrayCountForDashboardDelta = this.calculatePercentage(uGrayCounterAverages, this.ds.uGrayCountForDashboard);
    } else {
      this.notification.warning('Dashboard data could not get for this date parameter!', true);
    }

    // Total Traffic Chart
    var trafficChartoptions = {
      chart: { height: 270, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 6] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [[0], [0]],
      markers: { size: 0, hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'left', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
      tooltip: { theme: 'dark' }
    }
    this.trafficChart = new ApexCharts(document.querySelector("#trafficChartHits"), trafficChartoptions);
    this.trafficChart.render();
    this.trafficChart.updateSeries([{ name: "Today Hits", data: this.ds.totalHits }, { name: " Total Hit Averages", data: this.ds.hitAverages }])

    //Blocked Chart
    // var options2 = {
    //   chart: { height: 250, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
    //   dataLabels: { enabled: false },
    //   stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 6] },
    //   colors: ['#9d60fb', '#4a90e2'],
    //   series: [[0], [0]],
    //   markers: { size: 0, hover: { sizeOffset: 6 } },
    //   xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
    //   grid: { borderColor: '#626262', strokeDashArray: 6, },
    //   legend: { position: 'top', horizontalAlign: 'right', show: true },
    //   annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
    //   tooltip: { theme: 'dark' }
    // }
    // var blockedChart = new ApexCharts(document.querySelector("#trafficChartBlocked"), options2);
    // blockedChart.render();
    // blockedChart.updateSeries([{ name: "Today Blockeds", data: this.ds.totalBlocks }, { name: "Average Blockeds", data: this.ds.blockAverages }])

    //Uniquer Domain Chart
    var uniqueDomainOptions = {
      chart: { height: 250, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [[0], [0]],
      markers: { size: 0, hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'left', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    }
    this.uniqueDomainChart = new ApexCharts(document.querySelector("#uniqueDomainChart"), uniqueDomainOptions);
    this.uniqueDomainChart.render();
    this.uniqueDomainChart.updateSeries([{ name: "Unique Domain", data: this.ds.uniqueDomain }, { name: "Unique Domain Avg", data: this.ds.uniqueDomainAvg }]);

    //Unique Subdomain Chart
    var uniqueSubdomainChartOptions = {
      chart: {
        height: 250, type: 'line', zoom: { enabled: false },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false, tools: { download: false }
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ name: "Unique Subdomain", data: this.ds.uniqueSubdomain }, { name: "Unique Subdomain Avg", data: this.ds.uniqueSubdomainAvg }],
      markers: { size: 0, hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'left', show: true },
      annotations: { yaxis: [{ label: { fontSize: '20px' } }] }
    }
    var uniqueSubdomainChart = new ApexCharts(document.querySelector("#uniqueSubdomainChart"), uniqueSubdomainChartOptions);
    uniqueSubdomainChart.render();

    // Unique Dest Ip Chart
    var uniqueDestIpChartOptions = {
      chart: { height: 250, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
      dataLabels: { enabled: false },
      stroke: { width: [3, 3], curve: 'smooth', dashArray: [0, 10] },
      colors: ['#9d60fb', '#4a90e2'],
      series: [[0], [0]],
      markers: { size: 0, hover: { sizeOffset: 6 } },
      xaxis: { categories: this.labelArray, labels: { minHeight: 20 } },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#626262', strokeDashArray: 6, },
      legend: { position: 'top', horizontalAlign: 'left', show: true },
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
          startAngle: -100,
          endAngle: 100,
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
      series: [0],
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
    for (let i = 0; i < this.elasticData.length; i++) {
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
    for (let i = 0; i < this.elasticData.length; i++) {
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
}
