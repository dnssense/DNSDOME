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

@Component({
    selector: 'app-captive',
    templateUrl: 'captive.component.html'
})
export class CaptiveComponent implements OnInit, OnDestroy {
    newUserCount: number;
    totalUserCount: number;
    rushDay: string;
    onlineUserCount: number;

    constructor(private notificationService: NotificationService, private config: ConfigService,
        private http: HttpClient, private translator: TranslatorService) {

        this.getStatistics();

    }

    getStatistics() {
        this.http.post<any>(this.config.getApiUrl() + '/api/captive', {}).subscribe(
            data => {
            this.notificationService.success(data);
            this.newUserCount = data.newUserCount;
            this.totalUserCount = data.totalUserCount;
            this.rushDay = data.rushDay;
            this.onlineUserCount = data.onlineUserCount;
                },
            err => {

            });
    }

    ngOnDestroy(): void {
    }
    ngOnInit(): void {

        const dataPreferences = {
            labels: ['62%', '32%', '6%'],
            series: [62, 32, 6]
        };

        const optionsPreferences = {
            height: '230px'
        };

        new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);

        const dataColouredRoundedLineChart = {
            labels: ['Pzt', 'Sa', 'Çar', 'Per', 'Cu', 'Cts', 'Paz'],
            series: [
                [287, 480, 290, 554, 220, 690, 500]
            ]
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

    errorHttp() {
        this.http.post('http://localhost:100/api', {}).subscribe(
            x => {

            }
        );

    }


    throwException() {
        throw new Error("captive error");
    }

    language(lang: string) {
        this.config.setTranslationLanguage(lang);
    }
    invalidmsg = 'invalid url';
    language2() {
        this.invalidmsg = this.translator.translate('InvalidUrl')
    }



    getcategory() {
        this.http.post<any>(this.config.getApiUrl() + "/dashboard/list", {}).subscribe(data => {
            debugger;
        },
            err => {
                debugger;
            });
    }










}
