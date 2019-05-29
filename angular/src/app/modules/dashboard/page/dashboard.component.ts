import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
  malwareCountForDashboard: number;
  uMalwareCountForDashboard: number;
  totalHitCountForDashboard: number;
  totalBlockCountForDashboard: number;
  searchKey: string;
  public labelArray = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];
  categoryList = [];
  categoryListFiltered = [];
  selectedCategoryForTraffic = CategoryV2;
  selectedCategoryForBlocked = CategoryV2;
  trafficChartType: string = 'hit';
  uniqueChartType: string = 'domain';
  companyId: number;

  constructor(private dashboardService: DashBoardService, private auth: AuthenticationService, private datePipe: DatePipe,
    private staticService: StaticService) {

    this.selectedCategoryForTraffic = null;
    this.selectedCategoryForBlocked = null;

    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
      this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList));//deep copy
    });

    this.elasticData = [];

    this.auth.getCurrentUser().subscribe(cu => {
      this.companyId = cu.currentUser.companyId;
      this.getElasticData(Date.now());
    });
  }


  private getElasticData(date: number) {
    debugger;
    this.dashboardService.getHourlyCompanySummary(this.companyId.toString(), this.datePipe.transform(date, 'yyyy-MM-dd')).subscribe(res => {
      this.elasticData = res;
      console.log(this.elasticData);

      this.elasticData.forEach(d => { d.hourIndex = new Date(d.time_range.gte).getHours(); });
      this.elasticData.sort((x, y) => { return x.hourIndex - y.hourIndex; });
      this.createCharts();
    });
  }

  ngOnInit(): void {

  }

  changeDateParameter(param: number) {
    var today = new Date();
    this.dateParameter = param;
    this.getElasticData(new Date().setDate(today.getDate() - param));
  }

  createCharts() {
    debugger
    //buralar model haline getirilmeli
    this.malwareCountForDashboard = 0;
    this.uMalwareCountForDashboard = 0;
    let hitAverages = [];
    let todayHits = [];
    let blockAverages = [];
    let todayBlocks = [];
    let uniqueDomain = []
    let uniqueDomainAvg = []
    let uniqueSubdomain = []
    let uniqueSubdomainAvg = []
    let uniqueDesIp = []
    let uniqueDesIpAvg = []


    for (let i = 0; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];
      hitAverages.push(Math.round(data.averages.total_hit));
      todayHits.push(data.total_hit);
      blockAverages.push(Math.round(data.averages.blocked_count));
      todayBlocks.push(data.blocked_count);
      uniqueDomain.push(data.unique_domain);
      uniqueDomainAvg.push(Math.round(data.averages.unique_domain))
      uniqueDesIp.push(data.unique_destip)
      uniqueDesIpAvg.push(Math.round(data.averages.unique_destip))
      uniqueSubdomain.push(data.unique_subdomain)
      uniqueSubdomainAvg.push(Math.round(data.averages.unique_subdomain))
      // this.malwareCountForDashboard += data.category_hits[Object.keys(data.category_hits)[36]].hits;//malware categoyr degerleri aliniyor
      // this.uMalwareCountForDashboard += data.category_hits[Object.keys(data.category_hits)[36]].unique_domain;
    }

    this.totalHitCountForDashboard = todayHits.reduce((a, b) => a + b);
    this.totalBlockCountForDashboard = todayBlocks.reduce((a, b) => a + b);

    var trafficChartoptions = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 6]
      },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ name: "Today Hits", data: todayHits }, { name: "Average Hits", data: hitAverages }],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: this.labelArray,
        labels: {
          minHeight: 20
        }
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        show: true
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      },
      tooltip: {
        theme: 'dark'
      }
    }

    var chart1 = new ApexCharts(
      document.querySelector("#trafficChartHits"),
      trafficChartoptions
    );
    chart1.render();

    var options2 = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 6]
      },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{ name: "Today Blockeds", data: todayBlocks }, { name: "Average Blockeds", data: blockAverages }],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: this.labelArray,
        labels: {
          minHeight: 20
        }
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        show: true
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      },
      tooltip: {
        theme: 'dark'
      }
    }

    var chart2 = new ApexCharts(
      document.querySelector("#trafficChartBlocked"),
      options2
    );
    chart2.render();

    var uniqueDomainOptions = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 10]
      },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{
        name: "Unique Domain",
        data: uniqueDomain
      },
      {
        name: "Unique Domain Avg",
        data: uniqueDomainAvg
      }
      ],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: this.labelArray,
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        theme: 'dark'
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      }
    }
    var uniqueDomainChart = new ApexCharts(
      document.querySelector("#uniqueDomainChart"),
      uniqueDomainOptions
    );
    uniqueDomainChart.render();

    var uniqueSubdomainChartOptions = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 10]
      },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{
        name: "Unique Subdomain",
        data: uniqueSubdomain
      },
      {
        name: "Unique Subdomain Avg",
        data: uniqueSubdomainAvg
      }
      ],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: this.labelArray,
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        theme: 'dark'
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      }
    }
    var uniqueSubdomainChart = new ApexCharts(
      document.querySelector("#uniqueSubdomainChart"),
      uniqueSubdomainChartOptions
    );
    uniqueSubdomainChart.render();

    var uniqueDestIpChartOptions = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 10]
      },
      colors: ['#9d60fb', '#4a90e2'],
      series: [{
        name: "Unique Dest. Ip",
        data: uniqueDesIp
      },
      {
        name: "Unique Dest. Ip Avg",
        data: uniqueDesIpAvg
      }
      ],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: this.labelArray,
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        theme: 'dark'
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      }
    }
    var uniqueDestIpChart = new ApexCharts(
      document.querySelector("#uniqueDestIpChart"),
      uniqueDestIpChartOptions
    );
    uniqueDestIpChart.render();


    var gaugeOptions = {
      chart: {
        height: 250,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          startAngle: -100,
          endAngle: 100,
          dataLabels: {
            name: {
              fontSize: '16px',
              color: '#e4e4e4',
              offsetY: 25
            },
            value: {
              offsetY: -20,
              fontSize: '22px',
              color: '#fffefe'
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#3ad333'],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      colors: ['#fa1e1e'],
      series: [93],
      labels: ['Risk Score'],

    }
    var gaugeChart = new ApexCharts(
      document.querySelector("#gaugeChart"),
      gaugeOptions
    );
    gaugeChart.render();

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


  generateData(count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = '00 : ' + (i < 10 ? '0' : '') + (i + 2).toString();
      var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push({
        x: x,
        y: y
      });
      i++;
    }
    return series;
  }

  searchCategoryForTraffic(val: any) {
    this.categoryListFiltered = this.categoryList.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
  }

  deleteCatFromTraffic(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForTraffic = null;
    }
  }

  addCategoryToTraffic(id: number) {
    this.selectedCategoryForTraffic = this.categoryList.find(c => c.id == id);

  }

  //delete cat from unique counter based olarak degisecek
  deleteCatFromBlocked(id: number) {
    if (id && id > 0) {
      this.selectedCategoryForBlocked = null;
    }

  }

  addCategoryToBlocked(id: number) {
    this.selectedCategoryForBlocked = this.categoryList.find(c => c.id == id);
  }


}
