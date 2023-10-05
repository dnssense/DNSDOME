import {
  AfterViewInit, ChangeDetectorRef,
  Component, ComponentRef, EventEmitter,
  inject,
  Input, NgZone, OnDestroy,
  OnInit, Output, Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import numeral from 'numeral';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexLegend,
  ApexFill,
  NgApexchartsModule,
  ApexTooltip, ApexYAxis, ApexStroke, ApexStates, ApexGrid,
} from 'ng-apexcharts';
import {TranslateModule} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {skip, switchMap, takeUntil} from 'rxjs/operators';
import * as momenttz from 'moment-timezone';
import {
  RkNSwitchModel,
  RkNSwitchModule,
  RkTranslatorService,
  BaseFilterInput,
  RkSpinnerDirective,
  TimeNavigationButtonComponent,
  RkTooltipComponent,
  RkSelectControlComponent,
  RkFilterServiceV2, TrafficFilterBadgeModel, RkNotificationService
} from 'roksit-lib';
import {FeatherModule} from 'angular-feather';
import {DnsTunnelCommunicationService} from '../../services/dns-tunnel-communication.service';
import {TunnelSeverityNamePipe} from '../../pipes/dns-tunnel-pipes';
import {
  DnsTunnelColumns,
  DnsTunnelHistogramItem,
  DnsTunnelHistogramUIRequest,
  DnsTunnelHistogramUIResponse,
  DnsTunnelLevel,
  DnsTunnelService
} from '../../../../../core/services/dns-tunnel.service';
import {DnsTunnelHistogramTooltipComponent} from './histogram-tooltip/dns-tunnel-histogram-tooltip.component';



interface ChartOptions {
  series: ApexAxisChartSeries;
  colors: any[];
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  responsive: ApexResponsive[];
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  stroke: ApexStroke;
  legend: ApexLegend;
  states: ApexStates;
}

export class TunnelChartData {
  series: { name: string, data: number[], type: DnsTunnelLevel}[];
  categories: string[];
  colors: string[];
}

@Component({
  selector: 'dns-tunnel-histogram',
  standalone: true,
  imports: [CommonModule, RkNSwitchModule, RkSpinnerDirective, FeatherModule, NgApexchartsModule, TranslateModule, RkSelectControlComponent, DnsTunnelHistogramTooltipComponent, TimeNavigationButtonComponent, RkSpinnerDirective, RkTooltipComponent, TunnelSeverityNamePipe],
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.sass']
})
export class DnsTunnelHistogramComponent implements OnInit, AfterViewInit, OnDestroy {
  DnsTunnelLevels = DnsTunnelLevel;
  translationPrefix = 'DnsTunnel';
  translatorService = inject(RkTranslatorService);
  notifService = inject(RkNotificationService);
  viewContainerRef = inject(ViewContainerRef);
  tunnelService = inject(DnsTunnelService);
  rkFilterService = inject(RkFilterServiceV2);
  renderer2 = inject(Renderer2);
  ngZone = inject(NgZone);
  dnsTunnelCommunicationService = inject(DnsTunnelCommunicationService);
  ngUnsubscribe: Subject<any> = new Subject<any>();
  @ViewChild('histogramChart') histogramChart: ChartComponent;
  @ViewChild('chartWrapper', {static: false}) chartWrapper;
  dateOptions: RkNSwitchModel[] = [
    {value: 60 * 24 * 7, displayText: this.translatorService.translate('Date.LastXDay', {X: '7'})},
    {value: 60 * 24, displayText: this.translatorService.translate('Date.LastXHour', {X: '24'})},
  ];
  highSelected = true;
  suspiciousSelected = true;
  selectedDateOption: number;
  public chartOptions: Partial<ChartOptions>;
  chartData: TunnelChartData;
  data: DnsTunnelHistogramItem[];
  styles: CSSStyleDeclaration;
  interval: '1h'| '1d' = '1d';
  noMoreDetail: boolean;
  secMultiplier = 60 * 1000;
  disableNextBtn: boolean;
  loading: boolean;
  selectedPointIndex = -1;
  changeDetector = inject(ChangeDetectorRef);
  _filter: BaseFilterInput;
  @Input() filterTypes: Map<string, TrafficFilterBadgeModel>;
  searchRequired = false;
  @Input()
  public get filter(): BaseFilterInput {
    return this._filter;
  }
  public set filter(value: BaseFilterInput) {
    this._filter = this.rkFilterService?.copyBaseFilter(value);
  }
  infoMsg: string;
  total_hit: number;
  private onDataListEvent$ = new Subject<boolean>();
  onDataListEventObservable$ = this.onDataListEvent$.asObservable();
  @Output() onHistogramDateChanged = new EventEmitter();
  @Output() onHistogramGroupChanged = new EventEmitter<{high: boolean, suspicious: boolean}>();
  @Output() onDateOptionSet = new EventEmitter<number>();
  ngOnInit(): void {
    this.initGetDataListener();
    this.styles = getComputedStyle(document.body);
    this.updateSeverityGroup();
  }
  getData =  () => {
      this.onDataListEvent$.next(true);
  }
  initGetDataListener = () => {
    this.onDataListEventObservable$.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => {
        const req = {
          time_info: this.getTimeInfo()
        } as DnsTunnelHistogramUIRequest;
        if (this.filter) {
          req.filter = {...this.filter};
          req.filter.gte = this.filter.gte;
          req.filter.lt = this.filter.lt;
        }
        this.showLoading(true);
        return this.tunnelService.getHistogram(req);
      })
    ).subscribe((data: DnsTunnelHistogramUIResponse) => {
      this.processResponse(data);
    }, () => {
      this.showLoading(false);
      this.data = [];
      this.drawChart();
      this.notifService.error(this.translatorService.translate('GenericError'));
    });
  }
  getTimeInfo = () => {
    return {
      interval: this.calculateIntervalByDate(),
      time_zone: momenttz.tz.guess()
    };
  }
  showLoading = (isLoading: boolean) => {
    this.loading = isLoading;
  }
  processResponse = (data: DnsTunnelHistogramUIResponse) => {
    this.showLoading(false);
    if (!data || !data.results) {
      this.data = [];
      return;
    }
    this.infoMsg = '';
    if (!data?.total_count && this.selectedPointIndex >= 0)
      this.noMoreDetail = true;
    if (data?.total_count || !this.noMoreDetail) {
      this.data = data?.results as DnsTunnelHistogramItem[];
      this.interval = this.calculateIntervalByDate();
      this.total_hit = data.total_count;
    }
    this.drawChart();
    setTimeout(() => {
      // reset options after drawing table
      this.noMoreDetail = false;
      this.selectedPointIndex = -1;
    }, 1000);
  }

  onFilterChange(): void {
    if (this.noMoreDetail) { // draw without loading date with new interval for 20s intervals
      this.drawChart();
      setTimeout(() => {
        // reset options after drawing table
        this.noMoreDetail = false;
        this.selectedPointIndex = -1;
      }, 1000);
      return;
    }
    this.setSelectedDateOption(undefined);
    this.updateSeverityGroup();
    this.checkNextBtn();
    this.getData();
  }
  ngAfterViewInit(): void {
    this.checkNextBtn();
    this.getData();
    this.rkFilterService.filterAppliedListener.pipe(takeUntil(this.ngUnsubscribe), skip(1)).subscribe((filter: BaseFilterInput) => {
      if (this.noMoreDetail) {
        this.drawChart();
        setTimeout(() => {
          // reset options after drawing table
          this.noMoreDetail = false;
          this.selectedPointIndex = -1;
        }, 1000);
        return;
      }
      const newFilter = {...filter, filterList: filter?.filterList.filter(f => !this.filterTypes.get(f.name)?.disableBySystem)};
      if (filter.lt - filter.gte <= this.secMultiplier * 60) {
        newFilter.lt = this.filter.lt;
        newFilter.gte = this.filter.gte;
      }
      let shouldSearch;
      if (!this.filter) {
        shouldSearch = true;
      } else {
        shouldSearch = this.rkFilterService.compareBaseFilters(newFilter, this.filter);
      }
      if (shouldSearch || this.searchRequired) {
        this.searchRequired = false;
        this.filter = newFilter;
        this.onFilterChange();
      }
    });

  }
  updateSeverityGroup = () => {
    let hasGroupFilter = false;
    this.filter?.filterList?.forEach(f => {
      if (f.name === DnsTunnelColumns.ISTunnel && !(f?.disableBySystem || f?.disableByUser) && f?.values?.length > 0) {
        hasGroupFilter = true;
        let hasHigh = false;
        let hasSuspicious = false;
        f.values?.forEach(v => {
          if (v.value === DnsTunnelLevel.High) {
            hasHigh = true;
          }
          if (v.value === DnsTunnelLevel.Suspicious) {
            hasSuspicious = true;
          }
        });
        if (hasHigh) {
          this.highSelected = f.equal;
        } else {
          this.highSelected = !f.equal;
        }
        if (hasSuspicious) {
          this.suspiciousSelected = f.equal;
        } else {
          this.suspiciousSelected = !f.equal;
        }
        if (!hasHigh && !hasSuspicious) {
          hasGroupFilter = false;
        }
      }
    });
    if (!hasGroupFilter) {
      this.highSelected = true;
      this.suspiciousSelected = true;
    }
  }

  onGroupChange = (type: 'high' | 'suspicious', value: boolean) => {
    const total = !value && (this.highSelected ? 1 : 0 ) + (this.suspiciousSelected  ? 1 : 0);
    switch (type) {
      case 'high':
        this.highSelected = value;
        if (total === 1) {
          setTimeout(() => this.highSelected = !this.highSelected, 100);
        }
        break;
      case 'suspicious':
        this.suspiciousSelected = value;
        if (total === 1) {
          setTimeout(() => this.suspiciousSelected = !this.suspiciousSelected, 100);
        }
        break;
      default:
        break;
    }
    if (total === 1) {
      return;
    }
    this.changeDetector.detectChanges();
    if (!this.highSelected  && !this.suspiciousSelected) {
      this.highSelected = true;
      this.suspiciousSelected = true;
    }
    this.onHistogramGroupChanged.emit({high: this.highSelected, suspicious: this.suspiciousSelected});

  }
  checkNextBtn = () => {
    this.disableNextBtn = this.filter.lt  >= new Date().getTime();
  }
  dateOptionChanged(value: number) {
    this.setSelectedDateOption(value);
    let endDate = new Date();
    let startDate = new Date(endDate.getTime());
    startDate.setMinutes(startDate.getMinutes() - this.selectedDateOption);
    let dates;
    switch (this.selectedDateOption) {
      case this.dateOptions[0].value:
        this.interval = '1d';
        dates = this.dnsTunnelCommunicationService.getDateInterval(startDate, 'days', this.selectedDateOption);
        startDate = dates[0];
        endDate = dates[1];
        break;
      case this.dateOptions[1].value:
        this.interval = '1h';
        dates = this.dnsTunnelCommunicationService.getDateInterval(startDate, 'hours', this.selectedDateOption);
        startDate = dates[0];
        endDate = dates[1];
        break;
      default:
        break;
    }
    this.changeDate(startDate.getTime(), endDate.getTime());
    setTimeout(() => {
      this.setSelectedDateOption(value);
    }, 300);
  }
  formatChartData = (): TunnelChartData => {
    const highSeries = [], suspiciousSeries = [], categories  = [], series  = [], colors = [];
    this.data?.forEach((item, index) => {
      if (this.interval === '1h') {
        categories.push(moment(item.date).format('HH:mm'));
      } else
        categories.push([moment(item.date).format('DD MMM YYYY'), moment(item.date).format('dddd')]);
      highSeries.push(this.highSelected ? item?.high || 0 : 0);
      suspiciousSeries.push(this.suspiciousSelected ? item?.suspicious || 0 : 0);
    });
    if (this.suspiciousSelected) {
      series.push({
        name:  this.translatorService.translate(this.translationPrefix + '.UnderInvestigation'),
        data:  suspiciousSeries,
        type: DnsTunnelLevel.Suspicious });
      colors.push(this.styles.getPropertyValue('--harmful').trim());
    }

    if (this.highSelected) {
      series.push({
        name:  this.translatorService.translate(this.translationPrefix + '.TunnelDetected'),
        data:  highSeries,
        type: DnsTunnelLevel.High });
      colors.push(this.styles.getPropertyValue('--security').trim());
    }

    return {series, categories, colors};
  }

  calculateIntervalByDate = ():  '1h'| '1d' => {
    const dateDiff = (this.filter.lt - this.filter.gte);
    const currentDateTs = moment();
    if (dateDiff <= (this.dateOptions[1].value as number) * this.secMultiplier) {
      if (this.disableNextBtn  && currentDateTs.endOf('hour').toDate().getTime() >= this.filter.lt) {
        this.setSelectedDateOption(this.dateOptions[1].value as number);
      }
      return '1h';
    }
    if (this.disableNextBtn && currentDateTs.endOf('day').toDate().getTime() >= this.filter.lt) {
      this.setSelectedDateOption(this.dateOptions[0].value as number);
    }
    return '1d';
  }

  setSelectedDateOption(option: number) {
    this.selectedDateOption = option;
    this.onDateOptionSet.emit(this.selectedDateOption);
  }
  changeWeek(type: 'prev' | 'next') {
    const diff = (this.filter.lt - this.filter.gte) + 1;
    let lt;
    let gte;
    switch (type) {
      case 'prev':
        lt = this.filter.lt - diff;
        gte = this.filter.gte - diff;
        break;
      default:
        lt = this.filter.lt + diff;
        gte = this.filter.gte + diff;
        break;
    }
    this.changeDate(gte, lt);
  }

  changeDate = (gte: number, lt: number) => {
    this.onHistogramDateChanged.emit({gte, lt});
  }

  getRoundedNumber(value: number) {
    return numeral(value).format('0.0a').replace('.0', '').toUpperCase();
  }

  drawChart = () => {
    this.chartData = this.formatChartData();
    this.setChartOptions();
    if (this.selectedPointIndex >= 0 && this.noMoreDetail) {
      setTimeout(() => {
        const chartSize = [...this.calculateSize()];
        let offsetX = -1 * chartSize[0];
        let selectedPoint = this.selectedPointIndex;
        if (this.selectedPointIndex === this.chartData.categories.length - 1 ) {
          offsetX = chartSize[1] + chartSize[0];
          selectedPoint = this.selectedPointIndex - 1;
        }
        this.histogramChart?.addXaxisAnnotation({
          x: this.chartData.categories[selectedPoint],
          x2: this.chartData.categories[selectedPoint + 1],
          strokeDashArray: 0,
          borderColor: this.styles.getPropertyValue('--primary-light-200').trim(),
          fillColor: this.styles.getPropertyValue('--primary-light-200').trim(),
          opacity: 1,
          offsetX: offsetX
        }, false);
      } , 400);
    }

  }

  showDetail = (dataPointIndex) => {
    if ((this.data[dataPointIndex].high  + this.data[dataPointIndex].suspicious) === 0)
      return;
    const gte = this.data[dataPointIndex].date;
    let lt;
    if (this.interval === '1d') {
      lt = gte + (this.dateOptions[1].value as number) * this.secMultiplier - 1;
    } else if (this.interval === '1h') {
      lt = gte + (60 * this.secMultiplier) - 1;
      this.noMoreDetail = true;
    }
    this.selectedPointIndex = dataPointIndex;
    this.changeDate(gte, lt);
  }

  calculateSize = (): [number, number] => {
    let offsetX = 0;
    let widthP = 33;
    if (this.data && this.chartWrapper?.nativeElement?.offsetWidth) {
      offsetX = this.chartWrapper?.nativeElement?.offsetWidth / (6 * this.data.length);
      widthP = Math.round((25 / (this.chartWrapper?.nativeElement?.offsetWidth / this.data.length)) * 100);
    }
    return [offsetX, widthP];
  }

  setChartOptions() {
    const data = [...this.calculateSize()];
    const offsetX = data[0];
    const widthP = data[1];
    let optionsUpdatedAfterFirstDraw = (this.histogramChart != null);
    this.chartOptions = {
      series: this.chartData?.series?.map(series => {
        return {
          name: series.name,
          data: series.data
        };
      }),
      chart: {
        type: 'bar',
        height: 275,
        width: '102%',
        redrawOnWindowResize: false,
        stacked: true,
        toolbar: {
          show: false
        },
        events: {
          markerClick: (event, chartContext, { seriesIndex, dataPointIndex, config}) => {
            this.ngZone.run(() => {
              this.showDetail(dataPointIndex);
            });
          },
          mounted: (chartContext, config) =>  {
            this.setCustomBarStyle();
            if (!optionsUpdatedAfterFirstDraw) {
              optionsUpdatedAfterFirstDraw = true;
              const sizeData = [...this.calculateSize()];
              const sizeOffsetX = sizeData[0];
              const sizeWidthP = sizeData[1];
              this.chartOptions.plotOptions.bar.columnWidth = `${sizeWidthP}%`;
              this.chartOptions.xaxis.labels.offsetX = -1 * sizeOffsetX;
              this.histogramChart?.updateOptions(this.chartOptions);
            }

          }

        },
        zoom: {
          enabled: false
        }
      },
      plotOptions: {
        bar: {
          columnWidth: `${widthP}%`,
          borderRadius: 2,
          borderRadiusApplication: 'end'
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      xaxis: {
        categories: this.chartData.categories,
        tickPlacement : 'between',
        crosshairs: {
          show: true,
          width: 'tickWidth',
          fill: {
            type: 'solid',
            color: this.styles.getPropertyValue('--primary-light-200').trim(),
          }
        },
        labels: {
          style: {
            colors: this.styles.getPropertyValue('--gray-9').trim(),
            fontSize: '11px'
          },
          offsetX: -1 * offsetX
        },
      },
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['transparent'],
        lineCap: 'square'
      },
      yaxis: {
        labels: {
          style: {
            colors: [this.styles.getPropertyValue('--gray-9').trim()],
            fontSize: '10px'
          },
          formatter: (value) => {
            return this.getRoundedNumber(value);
          }
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: true,
          color: '#78909C',
          width: 6,
          offsetX: 0,
          offsetY: 0
        },
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: true
          },
        },

      },
      states: {
        hover: {
          filter: {
            type: 'none',
          }
        },
        active: {
          filter: {
            type: 'none',
          }
        },
      },
      colors: [
        ({ value, seriesIndex, dataPointIndex, w }) => {
          return this.chartData.colors[seriesIndex];
        }
      ],
      tooltip: {
        shared: false,
        intersect: false,
        custom:  this.tooltipCustom.bind(this),
      },
      fill: {
        opacity: 1,
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 0.1,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 100]
        }
      }
    };
  }
  setCustomBarStyle = () => {
    let xElements = this.chartWrapper?.nativeElement?.querySelectorAll('.apexcharts-xcrosshairs');
    xElements?.forEach((el: HTMLElement)  => {
      this.renderer2.setStyle(el, 'cursor', 'pointer');
      this.renderer2.setStyle(el, 'pointer-events', 'visible');
    });
    xElements = this.chartWrapper?.nativeElement?.querySelectorAll('.apexcharts-series');
    xElements?.forEach((el: HTMLElement)  => {
      this.renderer2.setStyle(el, 'cursor', 'pointer');
    });
  }
  tooltipCustom({ series, seriesIndex, dataPointIndex, w  }) {
    const tooltip = document.createElement('div');
    this.viewContainerRef.clear();
    if (this.data.length > dataPointIndex ) {
      const componentRef: ComponentRef<DnsTunnelHistogramTooltipComponent> = this.viewContainerRef.createComponent(DnsTunnelHistogramTooltipComponent);
      let title;
      const startMs = this.data[dataPointIndex].date;
      let endMs;
      if (this.interval === '1h') {
        endMs = startMs + 60 * 60 * 1000;
        title = moment(startMs).format('HH') + ':00 - ' + moment(endMs).format('HH') + ':00';
      } else {
        endMs = startMs + 24 * 60 * 60 * 1000;
        title = moment(startMs).format('DD MMMM') + ' - ' + moment(endMs).format('DD MMMM');
      }
      componentRef.instance.chartData = this.chartData;
      componentRef.instance.title = title;
      componentRef.instance.dataPointIndex = dataPointIndex;

      tooltip.appendChild(componentRef.location.nativeElement);
      componentRef.changeDetectorRef.detectChanges();
    }

    return tooltip.outerHTML;
  }

  get navigationButtonTranslation(): string {
    if (this.interval === '1h') {
      return this.translatorService.translate('xHours', {arg: 24});
    } else {
      return this.translatorService.translate('xDays', {arg: 7});
    }
    return '';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
