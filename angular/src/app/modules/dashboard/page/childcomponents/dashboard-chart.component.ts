import {Component} from '@angular/core';
import * as moment from 'moment';
import {TranslateService} from '@ngx-translate/core';
import * as numeral from 'numeral';
export interface ChartDomainItem {
  max: number;
  min: number;
  hit: number;
  date: string;
}

export interface ChartDomain {
  items: ChartDomainItem[];
  chartType: 'line' | 'line-river';
}

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: 'dashboard-chart.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class DashboardChartComponent {
  constructor(private translateService: TranslateService) {
  }

  theme: any = 'light';
  chartId: string;
  containerId: string;
  trafficChart: ApexCharts;
  chartDomain: ChartDomain = {
    items: [],
    chartType: 'line'
  };

  // region direct ui methodes
  setTheme(theme) {
    this.theme = theme;
  }

  drawChart(chart: ChartDomain) {
    this.chartDomain = chart;
    if (chart.chartType === 'line') {
      this.drawChartTopDomain();
    } else {
      this.drawChartAnomaly();
    }
  }

  drawChartAnomaly() {
    const chartBg = this.theme === 'white' ? '#ffffff' : '#232328';
    const seriesMaxVal = this.getSeries();
    if (!seriesMaxVal.series.length && this.trafficChart) {
      this.trafficChart.updateSeries([
        { name: 'Min', type: 'area', data: [] },
        { name: 'Max', type: 'area', data: [] },
        { name: 'Hit', type: 'line', data: [] }
      ]);
      this.trafficChart.updateOptions({
        annotations: {
          points: []
        }
      });
      return;
    }
    const series = seriesMaxVal.series;
    const yMax = seriesMaxVal.maxVal;
    const points = this.getAnnotations(series);
    if (this.trafficChart) {
      this.trafficChart.destroy();
    }

    this.trafficChart = new ApexCharts(document.querySelector(`#${this.getChartContainerId()}`), {
      series: series,
      chart: {
        id: `${this.getChartId()}`,
        type: 'line',
        stacked: false,
        group: 'deneme',
        height: 280,
        foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
        zoom: {
          enabled: true
        },
        toolbar: {
          show: false,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
            customIcons: []
          },
          autoSelected: 'zoom'
        },
        events: {
          click: () => {
            console.log('clicked');
          },
          markerClick: () => {

          },
        }
      },
      colors: [chartBg, (this.theme === 'white' ? '#b1dcff' : '#004175'), '#0084ff'],
      stroke: {
        width: 2,
        curve: ['smooth', 'smooth', 'straight']
      },
      annotations: {
        points: points
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        x: {
          show: true
        },
        // fillSeriesColor: true,
        theme: 'dark',
        // tslint:disable-next-line:no-shadowed-variable
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          // const date = new Date(w.globals.seriesX[0][dataPointIndex]);

          const mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');
          // const mDate2 = moment(w.globals.seriesX[0][dataPointIndex]).utc(true).format('MMM DD YYYY - HH:mm');
          // const mDate3 = moment.utc(w.globals.seriesX[0][dataPointIndex]).local().format('MMM DD YYYY - HH:mm');
          return `
            <div class="__apexcharts_custom_tooltip">
              <div class="__apexcharts_custom_tooltip_date">${mDate}</div>

              <div class="__apexcharts_custom_tooltip_content">
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: #507df3"></span> Min: <b>${series[0][dataPointIndex]}</b>
                </span>
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: #c41505"></span> Max: <b>${series[1][dataPointIndex]}</b>
                </span>
                <span class="__apexcharts_custom_tooltip_row">
                  <span class="color" style="background: ${this.theme === 'white' ? '#b5dbff' : '#004175'}"></span> Hit: <b>${series[2][dataPointIndex]}</b>
                </span>

                <p>
                  ${this.translate('TooltipDescription')}
                </p>
                </div>
            </div>
          `;
        }
      },
      legend: {
        show: false
      },
      fill: {
        opacity: 1,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: true,
          trim: true,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm'
          },
          tickAmount: 7
        },
        lines: {
          show: true
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        min: 0,
        max: yMax + 10,
        tickAmount: 5,
        labels: {
          formatter: (value) => {
            return this.getRoundedNumber(value);
          }
        },
        lines: {
          show: true
        }
      },
      noData: {
        text: 'No Data',
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: '14px',
          fontFamily: undefined
        }
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
    });

    this.trafficChart.render();
  }

  getAnnotations(data: { name: string, type: string, data: any[][]}[]) {
    const points = [];
    if (!data.length) {
      return points;
    }
    for (let i = 0; i < data[0].data.length; i++) {
      const min = data[0].data[i][1];
      const max = data[1].data[i][1];
      const hit = data[2].data[i][1];

      const time = data[0].data[i][0];

      const percentMax = (hit - max) / max * 100;

      let color = '';

      if (percentMax >= 100) {
        color = '#c41505';
      } else if (percentMax >= 80) {
        color = '#9c1e6c';
      } else if (percentMax >= 60) {
        color = '#7c26bd';
      } else if (percentMax >= 40) {
        color = '#6158ca';
      } else if (percentMax >= 20) {
        color = '#507df3';
      }

      const elm = {
        x: time,
        y: hit,
        marker: {
          size: percentMax >= 20 ? 3 : 0,
          fillColor: color,
          strokeColor: color,
          strokeSize: percentMax >= 20 ? 3 : 0,
          radius: 2
        }
      };

      points.push(elm);

      points.push(isNaN(percentMax) ? 0 : percentMax);
    }

    return points;
  }

  drawChartTopDomain() {
    const seriesMaxVal = this.getSeries();
    const series = seriesMaxVal.series;
    if (this.trafficChart) {
      this.trafficChart.updateSeries(series);
      return;
    }
    this.trafficChart = new ApexCharts(document.querySelector(`#${this.getChartContainerId()}`), {
      series: series,
      chart: {
        id: `${this.getChartId()}`,
        foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
        type: 'line',
        height: 280,
        zoom: { enabled: false },
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
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        enabled: true,
        shared: true,
        theme: 'dark',
        // tslint:disable-next-line:no-shadowed-variable
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          // const date = new Date(w.globals.seriesX[0][dataPointIndex]);

          const mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');

          return `
            <div class="__apexcharts_custom_tooltip" id="top-domain-tooltip">
              <div class="__apexcharts_custom_tooltip_date">${mDate}</div>

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
          enabled: false
        }
      },
      grid: {
        borderColor: this.theme === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)',
      },
    });
    this.trafficChart.render();

  }
  // endregion

  getSeries(): { series: any[], maxVal: number } {
    const result = {series: [], maxVal: 0};
    if (this.chartDomain.chartType === 'line-river') {
      const minWithDate = [];
      const maxWithDate = [];
      const hitWithDate = [];
      this.chartDomain.items.forEach(it => {
        const date = moment(it.date).utc(true).toDate().getTime();
        const max = Math.max(it.max, it.min, it.hit);
        if (max > result.maxVal) {
          result.maxVal = max;
        }
        minWithDate.push([date, it.min]);
        maxWithDate.push([date, it.max]);
        hitWithDate.push([date, it.hit]);
      });
      result.series = [
        {name: 'Min', type: 'area', data: minWithDate},
        {name: 'Max', type: 'area', data: maxWithDate},
        {name: 'Hit', type: 'line', data: hitWithDate}
      ];
    } else {
      result.series = [{
        name: 'Hits',
        type: 'line',
        data: this.chartDomain.items.map(x => [moment(x.date).utc(true).toDate().getTime(), x.hit])
      }];
    }
    return result;
  }
  translate(data: string): string {
    return this.translateService.instant(data);
  }
  getChartId(): string {
    if (!this.chartId) {
      this.chartId = `${this.chartDomain.chartType}_${this.getRandomInt(100)}`;
    }
    return this.chartId;
  }
  getChartContainerId(): string {
    if (!this.containerId) {
      this.containerId = `container_${this.chartDomain.chartType}_${this.getRandomInt(100)}`;
    }
    return this.containerId;
  }
  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '');
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}
