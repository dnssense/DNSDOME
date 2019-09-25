import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { NotificationService } from 'src/app/core/services/notification.service';

//declare var Highcharts: any;
declare var jQuery: any;
declare var Papa: any;
declare var saveAs: any;
declare var html2canvas: any;
declare var moment: any;

@Component({
  selector: 'app-histogram',
  templateUrl: 'histogram.component.html',
  styleUrls: ['histogram.component.sass']
})
export class HistogramComponent implements OnInit, OnDestroy {
  //TODO gerekirse angular.jsona eklenecek
  // "node_modules/highcharts/js/highcharts.js",
  // "node_modules/highcharts/js/modules/exporting.js",
  public histogramShow: boolean = false;
  public loading: boolean = false;
  public date = new Date();
  public currentName = this.date.getFullYear() + "-" + this.date.getMonth() + "-" + this.date.getDay() + "-" + this.date.getHours() + "-" + this.date.getMinutes() + "-" + this.date.getTime();

  @ViewChild("graphComponent") graphComponent: ElementRef;

  @Input() public searchSetting: SearchSetting;
  @Input() public maxItems: number;
  @Output() public searchEmitter = new EventEmitter();

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(
    @Inject(ElementRef) elementRef: ElementRef,
    public fastReportService: FastReportService,
    private notificationService: NotificationService
  ) {

  }

  ngOnInit(): void { }
  ngAfterViewInit() {
    this.loadHistogram();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refresh() {
    this.loadHistogram();
  }

  public loadHistogram() {
    // this.spinnerService.start();
    this.fastReportService.loadHistogram(this.searchSetting).takeUntil(this.ngUnsubscribe).subscribe((res: any[]) => {

      let data: any[] = res;

      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      if (data != null && data.length > 0) {
        this.histogramShow = true;

        // Highcharts.setOptions({
        //   global: {
        //     useUTC: false
        //   }
        // });
        // jQuery(el).highcharts({
        //   chart: {
        //     zoomType: "x",
        //     events: {
        //       selection: (event) => {
        //         // log the min and max of the primary, datetime x-axis
        //         try {
        //           var startDate = Highcharts.dateFormat("%d.%m.%Y %H:%M:%S", event.xAxis[0].min);
        //           var endDate = Highcharts.dateFormat("%d.%m.%Y %H:%M:%S", event.xAxis[0].max);
        //           this.searchSetting.dateInterval = startDate + "-" + endDate;
        //           this.searchEmitter.emit(this.searchSetting);
        //         } catch (e) {
        //           alert(e);
        //         }
        //         // log the min and max of the y axis
        //       },
        //       load: function (event) {
        //       }
        //     }
        //   },
        //   title: {
        //     text: ""
        //   },
        //   exporting: {
        //     filename: "Histogram-" + this.currentName
        //   },
        //   subtitle: {
        //     text: "ZOOMMESSAGE"
        //     // document.ontouchstart === undefined ?
        //     //   this.roksitTranslateService.translateKey("HISTOGRAM.ZOOMMESSAGE") : this.roksitTranslateService.translateKey("HISTOGRAM.ZOOMMESSAGEPINCH")
        //   },
        //   xAxis: {
        //     type: "datetime"
        //   },
        //   yAxis: {
        //     title: {
        //       text: "COUNT" //this.roksitTranslateService.translateKey("GLOBALS.COUNT")
        //     },
        //     min: 0
        //   },
        //   legend: {
        //     enabled: false
        //   },
        //   plotOptions: {
        //     area: {
        //       fillColor: {
        //         linearGradient: {
        //           x1: 0,
        //           y1: 0,
        //           x2: 0,
        //           y2: 1
        //         },
        //         stops: [
        //           [0, Highcharts.getOptions().colors[0]],
        //           [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get("rgba")]
        //         ]
        //       },
        //       marker: {
        //         radius: 2
        //       },
        //       lineWidth: 1,
        //       states: {
        //         hover: {
        //           lineWidth: 1
        //         }
        //       },
        //       threshold: null
        //     }
        //   },
        //   series: [{
        //     type: "area",
        //     name: "COUNT", //this.roksitTranslateService.translateKey("GLOBALS.COUNT"),
        //     data: data
        //   }]
        // });
      } else {
        this.histogramShow = false;
      }
      this.stopRefreshing();

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }

  public stopRefreshing() {
    // this.spinnerService.stop();
  }

}
