import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import * as Chartist from 'chartist';
import { DashboardStatistic } from 'src/app/core/models/DashboardStatistic';

declare const $: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  stats: DashboardStatistic;

  constructor(private configService: ConfigService, private http: HttpClient) {

    this.stats = {
      rushDay: "Pazar",
      newUserCount: 12,
      totalUserCount: 130,
      onlineUserCount: 5,
      maleGenderRatio: 56,
      weeklyUsers: [334, 456, 766, 635, 189, 389, 100]
    };

  }

  ngOnDestroy() {
  }

  ngOnInit(): void {
    this.createConnectedUserChart();
    this.createPieCharts();

    let values: Map<string, number> = new Map();
    values.set('jqvmap2_ru', 234);
    values.set('jqvmap2_ca', 154);
    values.set('jqvmap2_us', 834);
    values.set('jqvmap2_br', 128);

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
          + code.toUpperCase();

        alert(message);

        console.log(element);
      }
    });


  }



  ngAfterViewInit(): void {
    window.setTimeout(function () {
      var element = document.getElementById('jqvmap2_ru');
      if (element) {
        element.setAttribute('fill', '#ff0000');
      }
    }, 1000);
 
  }

  createConnectedUserChart() {
    const dataColouredRoundedLineChart = {
      labels: ['Pzt', 'Sa', 'Çar', 'Per', 'Cu', 'Cts', 'Paz'],
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
      high: 1000,
      showPoint: true,
      fullWidth: true,
      height: '300px'
    };

    const colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart,
      optionsColouredRoundedLineChart);

    this.startAnimationForLineChart(colouredRoundedLineChart);
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
      height: '255px'
    };

    new Chartist.Pie('#birincipasta', dataPreferences, optionsPreferences);

  }

  language(lang: string) {
    this.configService.setTranslationLanguage(lang);
  }

  getcategory() {
    this.http.post<any>(this.configService.getApiUrl() + "/dashboard/list", {}).subscribe(() => {
      debugger;
    },
      () => {
        debugger;
      });
  }


}
