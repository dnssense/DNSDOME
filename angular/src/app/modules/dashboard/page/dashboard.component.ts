import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import * as Chartist from 'chartist';
import { DashboardStatistic } from 'src/app/core/models/DashboardStatistic';
import { ValueTransformer } from '@angular/compiler/src/util';
import { TableData } from '../../shared/md/md-table/md-table.component';

declare const $: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStatistic;
  public tableData3: TableData;

  constructor(private configService: ConfigService, private http: HttpClient) {

    this.stats = {
      rushDay: "Pazar",
      newUserCount: 5612,
      totalUserCount: 130,
      onlineUserCount: 5345,
      maleGenderRatio: 56,
      weeklyUsers: [334, 456, 766, 635, 189, 389, 100]
    };

    this.tableData3 = {
      headerRow: [ 'Domain', 'Category' ],
      dataRows: [
          ['faceboook.com', 'Category A'],
          ['twss.com', 'Category A'],
          ['asdfd.com', 'Category B'],
          ['googlea.com', 'Category C'],
          ['somethibg.com', 'Category D'],
          ['cameliscamel.com', 'Category E'],
      ]
   };

  }

  ngOnDestroy() {
  }

  ngOnInit(): void {
    this.createConnectedUserChart();
    this.createPieCharts();

    let values: Map<string, number> = new Map();
    values.set('ru', 234);
    values.set('ca', 154);
    values.set('us', 834);
    values.set('br', 128);
    values.set('tr', 20);

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
        var message = 'You clicked "'
          + region
          + '" which has the code: '
          + code.toUpperCase() + ' value:' + values.get(code);

        alert(message);
      }
    });

    window.setTimeout(function () {

      values.forEach((value: number, key: string) => {
        var element = document.getElementById('jqvmap1_' + key);

        if (element) {
          if (value < 300) {
            element.setAttribute('fill', '#10bb20');
          } else {
            element.setAttribute('fill', '#ff0000');
          }
          element.title = value.toString();
        }
      });


    }, 1000);

  }




  createConnectedUserChart() {

    const dataSimpleBarChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]
      ]
    };

    const optionsSimpleBarChart = {
      seriesBarDistance: 10,
      axisX: {
        showGrid: false
      }
    };

    const responsiveOptionsSimpleBarChart: any = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value: any) {
            return value[0];
          }
        }
      }]
    ];

    const simpleBarChart = new Chartist.Bar('#simpleBarChart', dataSimpleBarChart, optionsSimpleBarChart,
     responsiveOptionsSimpleBarChart);

    // start animation for the Emails Subscription Chart
    this.startAnimationForBarChart(simpleBarChart);




    const dataColouredRoundedLineChart = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [this.stats.weeklyUsers, [134, 256, 66, 530, 289, 689, 700]]

    };
    const optionsColouredRoundedLineChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 5
      }),
      axisY: {
        showGrid: true,
        offset: 40
      },
      axisX: {
        showGrid: true,
      },
      low: 0,
      high: 900,
      showPoint: true,
      fullWidth: true,
      height: '250px'
    };

    const colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart,
      optionsColouredRoundedLineChart);

    this.startAnimationForLineChart(colouredRoundedLineChart);

    const dataColouredRoundedLineChart2 = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [this.stats.weeklyUsers, [134, 256, 66, 530, 289, 289, 700]]

    };
    const optionsColouredRoundedLineChart2: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 5
      }),
      axisY: {
        showGrid: true,
        offset: 40
      },
      axisX: {
        showGrid: true,
      },
      low: 0,
      high: 900,
      showPoint: true,
      fullWidth: true,
      height: '250px'
    };
    const colouredRoundedLineChart2 = new Chartist.Line('#colouredRoundedLineChart2', dataColouredRoundedLineChart2,
      optionsColouredRoundedLineChart2);

    this.startAnimationForLineChart(colouredRoundedLineChart2);

  }

  startAnimationForLineChart(chart: any) {
    let seq: number, delays: number, durations: number;
    seq = 0;
    delays = 80;
    durations = 500;
    chart.on('draw', function (data: any) {

      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  }

  startAnimationForBarChart(chart: any) {
    let seq2: number, delays2: number, durations2: number;
    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data: any) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  }

  createPieCharts() {

    const dataPreferences = {
      labels: ['62%', '32%', '6%'],
      series: [62, 32, 6]
    };

    const optionsPreferences = {
      donut: true,
      height: '150px'
    };

    new Chartist.Pie('#birincipasta', dataPreferences, optionsPreferences);

  }

  language(lang: string) {
    this.configService.setTranslationLanguage(lang);
  }

  getcategory() {
    this.http.post<any>(this.configService.getApiUrl() + "/dashboard/list", {}).subscribe(() => {

    },
      () => {

      });
  }


}
