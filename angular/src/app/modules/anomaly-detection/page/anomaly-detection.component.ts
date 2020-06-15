import { Component, OnInit } from '@angular/core';
import { LOCAL_STORAGE_THEME_COLOR } from '../../theme/theme.component';
import * as moment from 'moment';
import { ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
    templateUrl: 'anomaly-detection.component.html',
    styleUrls: ['anomaly-detection.component.scss']
})

export class AnomalyDetectionComponent implements OnInit {

    constructor(private configService: ConfigService, private authentication: AuthenticationService) {

    }

    domainQueryChart: any;

    domains;

    theme = 'white';

    ngOnInit() {
        this.drawDomainQueryChart();
    }

    private drawDomainQueryChart() {
        const currentUser = this.authentication.currentSession?.currentUser;
        this.theme = this.configService.getThemeColor(currentUser?.id);

        const series = [
            [new Date(2020, 4, 19).toISOString(), 180],
            [new Date(2020, 4, 20).toISOString(), 220],
            [new Date(2020, 4, 21).toISOString(), 280],
            [new Date(2020, 4, 22).toISOString(), 350],
            [new Date(2020, 4, 23).toISOString(), 480],
            [new Date(2020, 4, 24).toISOString(), 340],
            [new Date(2020, 4, 25).toISOString(), 270]
        ];

        this.domainQueryChart = new ApexCharts(document.querySelector('#anomaly-detection-domain-chart'), {
            series: [{
                name: 'Hits',
                type: 'line',
                data: series
            }],
            chart: {
                id: 'domain-quering-chart',
                foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
                type: 'line',
                height: 280,
                width: '100%',
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
            fill: {
                opacity: 1,
            },
            tooltip: {
                enabled: true,
                shared: true,
                x: {
                    format: 'MMM dd yyyy HH:mm'
                },
                theme: 'dark',
                custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const date = new Date(w.globals.seriesX[0][dataPointIndex]);

                    const mDate = moment(date).format('MMM DD YYYY - HH:mm');

                    return `
                    <div class="__apexcharts_custom_tooltip" id="top-domain-tooltip">
                      <div class="__apexcharts_custom_tooltip_date" >${mDate}</div>

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
                    enabled: false,
                },
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
            responsive: [
                {
                    breakpoint: 1000,
                    options: {
                        width: '100%'
                    }
                }
            ]
        });
        this.domainQueryChart.render();
    }

    onItemAdded($event) {

    }

    search() {

    }

}
