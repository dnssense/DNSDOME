import { OnInit, ElementRef, OnDestroy, Component, ViewChild } from '@angular/core';
import * as Chartist from 'chartist';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HistogramComponent } from '../shared/histogram/histogram.component';
import { Subscription, Subject } from 'rxjs';
import { CustomReportSearchComponent } from './search/customreport-search.component';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit, OnDestroy {

  public total: number = 0;
  public multiplier: number = 1;
  public histogramIsActive: boolean = false;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columns: LogColumn[];
  public data: any[];

  @ViewChild("tableDivComponent")
  tableDivComponent: ElementRef;
  // @ViewChild(HistogramComponent)
  // public histogramComponent: HistogramComponent;
  @ViewChild(CustomReportResultComponent)
  public customReportResultComponent: CustomReportResultComponent;
  @ViewChild(CustomReportSearchComponent)
  public customReportSearchComponent: CustomReportSearchComponent;

  private ngUnsubscribe: Subject<any> = new Subject<any>();
  private tableColumnsubscription: Subscription;
  private categoriesSubscription: Subscription;
  private applicationSubscription: Subscription;


  constructor(private customReportService: CustomReportService, private fastReportService: FastReportService, private notificationService: NotificationService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.tableColumnsubscription = this.fastReportService.tableColumns.takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;
    });
  }

  public updateSearchSetting(setting: any) {
    this.searchSetting = setting;
  }

  public search() {
    if (!this.searchSetting.columns.columns || this.searchSetting.columns.columns.length == 0) {
      //todo alert here. Focus on the table columns ...
      this.notificationService.warning("You must select at least one column for a report.");
      return;
    }
    if (this.histogramIsActive) {
      this.drawChart(this.searchSetting)
    } else {
      this.histogramIsActive = true;
      this.drawChart(this.searchSetting)
    }
    this.customReportResultComponent.search(this.searchSetting);
    // this.drawChart(this.searchSetting)
  }

  drawChart(settings: SearchSetting) {
    this.fastReportService.loadHistogram(settings).takeUntil(this.ngUnsubscribe).subscribe((res: any[]) => {

      debugger
      let data: any[] = res;

      let labelArray = [];
      let chartSeries = [data.length];
      for (let i = 0; i < data.length; i++) {
        const d = new Date(data[i].date);
        if (i % 3 == 0) {
          labelArray.push(d.getHours() + ":" + d.getMinutes())
        } else {
          labelArray.push(" ")
        }
        chartSeries.push(data[i].value)
      }

      const dataColouredRoundedLineChart = {
        labels: labelArray,
        series: [chartSeries]

      };
      const optionsColouredRoundedLineChart: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 2
        }),
        axisY: {
          showGrid: true,
          offset: 40
        },
        axisX: {
          showGrid: true,
        },
        low: Math.min(data.reduce((a, b) => Math.min(a, b)), data.reduce((a, b) => Math.min(a, b))),
        high: Math.max(data.reduce((a, b) => Math.max(a, b)), data.reduce((a, b) => Math.max(a, b))),
        showPoint: true,
        fullWidth: true,
        height: '250px'
      };

      const colouredRoundedLineChart = new Chartist.Line('#customReportChart', dataColouredRoundedLineChart,
        optionsColouredRoundedLineChart);

      this.startAnimationForLineChart(colouredRoundedLineChart);
    });
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


  public addValuesIntoSelected($event) {

    let column: string = $event.column;
    let value = $event.data;

    let exists = false;
    for (let a of this.searchSetting.must) {
      if (a.field == column && a.value == value) {
        exists = true;
        break;
      }
    }

    if (exists) {
      this.notificationService.error(column + "=" + value + " exists in your criteria");
      return;
    }

    let columnInput = new ColumnTagInput(column, "=", value);

    this.searchSetting.must.push(columnInput);

    this.notificationService.info(columnInput.toString() + " Added into your criteria");

    this.customReportSearchComponent.setSearchSetting(this.searchSetting);

  }

}
