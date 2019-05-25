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

  constructor(private dashboardService: DashBoardService, private auth: AuthenticationService, private datePipe: DatePipe,
    private staticService: StaticService) {

    this.selectedCategoryForTraffic = null;
    this.selectedCategoryForBlocked = null;

    this.staticService.getCategoryList().subscribe(res => {
      this.categoryList = res;
      this.categoryListFiltered = JSON.parse(JSON.stringify(this.categoryList));//deep copy
    });

    this.elasticData = [];

    this.getElasticData(Date.now());


  }


  private getElasticData(date: number) {
    this.auth.getCurrentUser().subscribe(cu => {
      this.dashboardService.getHourlyCompanySummary(cu.currentUser.companyId.toString(), this.datePipe.transform(date, 'yyyy-MM-dd')).subscribe(res => {
        this.elasticData = res;
        console.log(this.elasticData);

        this.elasticData.forEach(d => { d.hourIndex = new Date(d.time_range.gte).getHours(); });
        this.elasticData.sort((x, y) => { return x.hourIndex - y.hourIndex; });
        this.createCharts();
      });
    });
  }

  ngOnInit(): void {
    // let values: Map<string, number> = new Map();
    // values.set('ru', 234);
    // values.set('ca', 154);
    // values.set('us', 834);
    // values.set('br', 128);
    // values.set('tr', 20);

    // $('#worldMap').vectorMap({
    //   map: 'world_en',
    //   backgroundColor: 'transparent',
    //   borderColor: '#818181',
    //   borderOpacity: 0.25,
    //   borderWidth: 1,
    //   color: '#b3b3b3',
    //   enableZoom: true,
    //   hoverColor: '#eee',
    //   hoverOpacity: null,
    //   normalizeFunction: 'linear',
    //   scaleColors: ['#b6d6ff', '#005ace'],
    //   selectedColor: '#c9dfaf',
    //   selectedRegions: null,
    //   showTooltip: false,
    //   onRegionClick: function (element, code, region) {
    //     var message = 'You clicked "'
    //       + region
    //       + '" which has the code: '
    //       + code.toUpperCase() + ' value:' + values.get(code);

    //     alert(message);
    //   }
    // });

    // window.setTimeout(function () {

    //   values.forEach((value: number, key: string) => {
    //     var element = document.getElementById('jqvmap1_' + key);

    //     if (element) {
    //       if (value < 300) {
    //         element.setAttribute('fill', '#10bb20');
    //       } else {
    //         element.setAttribute('fill', '#ff0000');
    //       }
    //       element.title = value.toString();
    //     }
    //   });


    // }, 1000);

  }

  changeDateParameter(param: number) {
    var today = new Date();
    this.dateParameter = param;
    this.getElasticData(new Date().setDate(today.getDate() - param));
  }

  createCharts() {

    this.malwareCountForDashboard = 0;
    this.uMalwareCountForDashboard = 0;
    let hitAverages = [24], todayHits = [24], blockAverages = [24], todayBlocks = [24];

    for (let i = 0; i < this.elasticData.length; i++) {
      const data = this.elasticData[i];
      hitAverages[data.hourIndex] = Math.round(data.averages.total_hit);
      todayHits[data.hourIndex] = data.total_hit;
      blockAverages[data.hourIndex] = Math.round(data.averages.blocked_count);
      todayBlocks[data.hourIndex] = data.blocked_count;

      // this.malwareCountForDashboard += data.category_hits[Object.keys(data.category_hits)[36]].hits;//malware categoyr degerleri aliniyor
      // this.uMalwareCountForDashboard += data.category_hits[Object.keys(data.category_hits)[36]].unique_domain;
    }
 
    // this.elasticData.forEach(e => {
    //   hitAverages[e.hourIndex] = Math.round(e.averages.total_hit);
    //   todayHits[e.hourIndex] = e.total_hit;
    //   blockAverages[e.hourIndex] = Math.round(e.averages.blocked_count);
    //   todayBlocks[e.hourIndex] = e.blocked_count;
    // });

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

    var options3 = {
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
        name: "Session Duration",
        data: [800, 630, 700, 400, 200, 250, 350, 400]
      },
      {
        name: "Page Views",
        data: [780, 600, 750, 330, 230, 220, 320, 380]
      }
      ],
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: ['15', '16', '17', '18', '19', '20', '21'],
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        theme: 'dark',
        y: [{
          title: {
            formatter: function (val) {
              return val + " (mins)"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val + " per session"
            }
          }
        }]
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

    var chart3 = new ApexCharts(
      document.querySelector("#uniqueCounterChart"),
      options3
    );

    chart3.render();

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
