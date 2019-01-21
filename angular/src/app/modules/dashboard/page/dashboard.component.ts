import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import * as Chartist from 'chartist';
import { DashboardStatsService } from 'src/app/core/services/dashboardstats.service';
import { DashboardStatistic } from 'src/app/core/models/DashboardStatistic';

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.component.html',
    providers: [DashboardStatsService]
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats: DashboardStatistic;

    constructor(private notificationService: NotificationService, private config: ConfigService,
        private http: HttpClient, private translator: TranslatorService, private dashboardStats: DashboardStatsService) {

        this.dashboardStats.getStatistics().subscribe(
            data => {
                this.stats = data;
                this.createConnectedUserChart();
                this.createPieCharts();
            }
        )
    }

    ngOnDestroy(): void {
    }
    ngOnInit(): void {
    }

    createConnectedUserChart() {

        const dataColouredRoundedLineChart = {
            labels: ['Pzt', 'Sa', 'Çar', 'Per', 'Cu', 'Cts', 'Paz'],
            series: [this.stats.weeklyUsers]

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
        chart.on('draw', function(data: any) {
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

        // new Chartist.Pie('#ikincipasta', {
        //     labels: ['Erkek', 'Kadın'],
        //     series: [this.stats.maleGenderRatio, (100 - this.stats.maleGenderRatio)]
        // }, {
        //         donut: true,
        //         donutWidth: 40,
        //         startAngle: 270,
        //         total: 200,
        //         showLabel: true
        //     });
    }

    language(lang: string) {
        this.config.setTranslationLanguage(lang);
    }
 
    getcategory() {
        this.http.post<any>(this.config.getApiUrl() + "/dashboard/list", {}).subscribe(data => {
            debugger;
        },
            err => {
                debugger;
            });
    }

    info() {
        this.notificationService.info("info msg");
    }
    error() {
        this.notificationService.error("error msg");
    }
    warning() {
        this.notificationService.warning("warning msg");
    }
    success() {
        this.notificationService.success("success msg");
    }
    danger() {
        this.notificationService.danger("danger msg");
    }

}
