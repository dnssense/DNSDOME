import { Component, OnInit, Input, Output, OnDestroy, EventEmitter, ElementRef, ViewChild, Renderer } from "@angular/core";
import { SearchSetting } from "src/app/core/models/SearchSetting";
import { Response } from "@angular/http";
import { FastReportService } from "src/app/core/services/FastReportService";
import "rxjs/Rx";
import { Observable, Subscription, Subject } from "rxjs/Rx";
import { CustomReportService } from "src/app/core/services/CustomReportService";
import { DashBoardService } from "src/app/core/services/DashBoardService";
import { SearchSettingService } from "src/app/core/services/SearchSettingService";
import { Dashboard } from "src/app/core/models/Dashboard";
import { SpinnerService } from 'src/app/core/services/spinner.service';

declare var Highcharts: any;
declare var jQuery: any;

@Component({
  selector: 'app-dashboard-top-panel',
  templateUrl: 'dashboard-top-panel.component.html'
})
export class DashboardTopPanelComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  public loading: boolean = false;

  @Input() logo: string;
  @Input() title: string;
  @Input() dashboard: Dashboard;

  @Input() setting: SearchSetting;
  @Input() grid: any;

  @Output() public removeReportEmitter = new EventEmitter();
  @Output() public currentSettingEmitter = new EventEmitter();
  @Output() public settingConfigUpdateEmitter = new EventEmitter();

  public sparkline: boolean = false;

  @ViewChild('graphComponent') graphComponent: ElementRef;

  @ViewChild('settingModal') settingModal: ElementRef;
  public gridstack: ElementRef;

  public name: string;
  public icon: string = "fa fa-cogs";

  public observable: Observable<any> = null;
  public subscription: Subscription = null;

  public expanded: boolean = true;
  public removed: boolean = false;

  public el: ElementRef;

  public chart: any = null;

  constructor(ele: ElementRef, private renderer: Renderer, public fastReportService: FastReportService,
    public customReportService: CustomReportService, public searchSettingService: SearchSettingService,
    public dashboardService: DashBoardService, public spinnerService: SpinnerService) {

    this.el = ele;
  }

  ngOnInit() {
    this.name = this.setting.name.replace("Report", "").replace("Weekly", "");
    this.setRfreshInterval(this.setting.refresh);

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  public removePanel() {
    this.removed = true;
    this.removeReportEmitter.emit(this.setting);
  }

  public expandPanel() {
    this.expanded = !this.expanded;
  }

  public addWidget() {

  }

  public stopRefreshing() {
    this.spinnerService.hide();
  }

  public setRfreshInterval(value: number) {

    if (value != -1) {
      if (this.observable != null) {
        this.subscription.unsubscribe();
        this.observable = null;
      }

      this.observable = Observable.create((observer) => {
        var id = setInterval(() => {
          observer.next('some event');
        }, value * 1000);

      });

      this.subscription = this.observable.takeUntil(this.ngUnsubscribe).subscribe(
        (data) => {
          this.refresh();
        },
        (error) => {
          alert(error)
        },
        () => {

        });

    } else {
      //time i güncellemişşse,
      if (this.observable != null) {
        this.subscription.unsubscribe();
        this.observable = null;
      }
      this.refresh();
    }
  }

  refresh() {

    this.createChart();

  }

  public createChart() {
    this.sparkline = false;
    if (this.setting.chartType == 'histogram') {
      this.icon = "fa fa-bar-chart";
      this.loadHistogram();
    } else if (this.setting.chartType == 'pie') {
      this.icon = "fa fa-pie-chart";
      this.showPie();
    } else if (this.setting.chartType == 'sparkline') {
      this.icon = "fa fa-line-chart";
      this.sparkline = true;
      this.loadSparklineBar();
    } else if (this.setting.chartType == 'sparklineLine') {
      this.icon = "fa fa-line-chart";
      this.sparkline = true;
      this.loadSparklineLine();
    }
    else if (this.setting.chartType == 'count') {
      this.icon = "fa fa-cogs";
    } else if (this.setting.chartType == 'table') {
      this.icon = "fa fa-table";
      this.loadTable();
    } else if (this.setting.chartType == 'bar') {
      this.icon = "fa fa-bar-chart";
      this.loadBar();
    } else if (this.setting.chartType == 'map') {
      this.icon = "fa fa-map-marker";
      this.loadMap();
    } else if (this.setting.chartType == 'multivalueHistogram') {
      this.icon = "fa fa-map-marker";
      this.loadMultiValueHistogram();
    } else if (this.setting.chartType == 'header') {
      this.icon = "fa fa-map-marker";
      this.loadDashboardHeader();
    }

  }

  public loadDashboardHeader() {
    debugger;
    this.spinnerService.show();
    this.customReportService.getDashboardHeaderSetting(this.setting).subscribe((res: Response) => {
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";
      el.innerHTML = res.text();

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );

  }

  public loadTable() {
    debugger;
    this.spinnerService.show();
    this.customReportService.getTableData(this.setting).subscribe((res:Response) => {
      console.log("I am in loadTable");
      console.log(res);
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";
      el.innerHTML = res.text();
     

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }

  public loadHistogram() {
    this.spinnerService.show();
    this.fastReportService.loadDashbaordHistogram(this.setting).subscribe((res) => {
      console.log("I am in histogram");
      console.log(res);
      var data = res;
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      let width = this.setting.config["width"];
      let height = this.setting.config["height"] - 50;


      jQuery(el).highcharts({
        chart: {
          zoomType: 'none',
          width: width,
          height: height
        },
        title: {
          text: ''
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: 'Count'
          },
          min: 0
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },

        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
            },
            marker: {
              radius: 2
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        },

        series: [{
          type: 'area',
          name: 'Count',
          data: data
        }]
      });

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }


  public showPie() {
    this.spinnerService.show();
    this.customReportService.getData(this.setting).subscribe((res) => {
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      let data: any[] = <any>res;

      if (data != null && data.length > 0) {
        let total = 0;
        let multiplier = 1;

        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][1]);
          total += val;
        }

        var maxPercentage = 0;
        let pieData = [];

        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][1]);
          let tempPercentage = val * 1.0 / total;
          if (tempPercentage > maxPercentage) {
            maxPercentage = tempPercentage;
          }
          data[i]["percentage"] = tempPercentage;
          pieData.push({
            name: data[i][0],
            y: val
          });
        }

        multiplier = Math.floor(100 / (maxPercentage * 100));

        for (let i = 0; i < data.length; i++) {
          if (data[i]["percentage"] == maxPercentage) {
            pieData[i]["sliced"] = true;
            pieData[i]["selected"] = true;
          }
        }

        let width = this.setting.config["width"];
        let height = this.setting.config["height"] - 50;

        if (this.chart != null) {
          this.chart.destroy();

        }

        this.chart = new Highcharts.Chart({
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            renderTo: el,
            spacingBottom: 3,
            spacingTop: 3,
            spacingLeft: 3,
            spacingRight: 3,
            // Explicitly tell the width and height of a chart
            width: width,
            height: height
          },
          title: {
            text: ''
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              slicedOffset: 20,
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
              }
            }
          },
          exporting: {
            enabled: false
          },
          series: [{
            name: '', // this.configItem.header
            colorByPoint: true,
            animation: {
              duration: 300
            },
            data: pieData

          }]
        });
      } else {
        el.innerHTML = "<div class='panel-body'><div class='alert alert-danger'><strong>No data found matching your search criteria. Please check your criterias and try again.</strong></div></div>";
      }
    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }


  public loadSparklineBar() {

    this.spinnerService.show();

    this.customReportService.getData(this.setting).subscribe((res) => {

      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";


      let data: any[] = <any>res;
      let datas = new Array();

      for (let i = 0; i < data.length; i++) {
        let val = parseInt(data[i][1]);
        if (data[i][0] != 'Others') {
          datas.push(val);
        }
      }

      datas = datas.reverse();

      let width = this.setting.config["width"];

      let height = this.setting.config["height"] - 40;
      height = Math.round(height / 4);

      let name = this.setting.name;

      var barValues = datas;
      var barValueCount = barValues.length;
      var barSpacing = 1;

      let charts = jQuery(el).sparkline(barValues, {
        type: 'bar',
        height: height,
        barWidth: Math.round((width - (barValueCount - 1) * barSpacing) / (1.1 * barValueCount)),
        barSpacing: barSpacing,
        zeroAxis: false,
        tooltipChartTitle: name,
        tooltipSuffix: ' ' + name,
        barColor: 'rgba(255,255,255,1)'
      });
    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }

  public loadSparklineLine() {

    this.spinnerService.show();

    this.customReportService.getData(this.setting).subscribe((res) => {
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      let data: any[] = <any>res;
      let datas = new Array();

      for (let i = 0; i < data.length; i++) {
        let val = parseInt(data[i][1]);
        datas.push(val);
      }


      let width = this.setting.config["width"];

      let height = this.setting.config["height"] - 40;


      let charts = jQuery(el).sparkline([57, 69, 70, 62, 73, 79, 76, 77, 73, 52, 57, 50, 60, 55, 70, 68], {
        type: 'line',
        width: '100%',
        height: '40',
        spotRadius: 5,
        lineWidth: 1.5,
        tooltipChartTitle: 'Usage',
        tooltipSuffix: ' %'

      });

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }


  public loadBar() {

    this.spinnerService.show();
    this.customReportService.getData(this.setting).subscribe((res: Response) => {

      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";
      let data: any[] = <any>res;

      if (data != null && data.length > 0) {
        let total = 0;
        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][1]);
          total += val;
        }

        var maxPercentage = 0;
        let datas: any[] = new Array();

        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][1]);
          let tempPercentage = val * 1.0 / total;
          if (tempPercentage > maxPercentage) {
            maxPercentage = tempPercentage;
          }
          data[i]["percentage"] = tempPercentage;
          datas.push([data[i][0], tempPercentage * 100]);
        }

        let width = this.setting.config["width"];
        let height = this.setting.config["height"] - 50;

        if (this.chart != null) {
          this.chart.destroy();
        }

        this.chart = new Highcharts.Chart({
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'column',
            renderTo: el,
            spacingBottom: 3,
            spacingTop: 3,
            spacingLeft: 3,
            spacingRight: 3,
            // Explicitly tell the width and height of a chart
            width: width,
            height: height
          },
          xAxis: {
            type: 'category',
            title: {
              text: null
            },
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '12px',
                fontFamily: 'Verdana, sans-serif'
              }
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Count'
            }
          },
          legend: {
            enabled: false
          },
          title: {
            text: ''
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f}%</b>'
          },
          exporting: {
            enabled: false
          },

          series: [{
            data: datas,
            type: "column",
            name: this.setting.name,
            showInLegend: true,
            dataLabels: {
              enabled: true,
              rotation: -90,
              color: '#FFFFFF',
              align: 'right',
              format: '{point.y:.1f}', // one decimal
              y: 10, // 10 pixels down from the top
              style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
              }
            }
          }]
        });
      } else {
        el.innerHTML = "<div class='panel-body'><div class='alert alert-danger'><strong>No data found matching your search criteria. Please check your criterias and try again.</strong></div></div>";
      }


    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }


  public singleValue() {

    this.spinnerService.show();

    this.customReportService.singleValue(this.setting).takeUntil(this.ngUnsubscribe).subscribe((res: Response) => {

      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";
      el.innerHTML = res.text();

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }


  public loadMultiValueHistogram() {
    this.spinnerService.show();
    this.fastReportService.getMultiValueHistogramData(this.setting, this.dashboard).subscribe((res: Response) => {
      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      var chartTitle = "";

      let datas: any[] = JSON.parse(res.text());

      this.chart = new Highcharts.Chart({
        chart: {
          type: 'spline',
          renderTo: el,
          zoomType: "xy"
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          type: 'datetime',
          labels: {
            overflow: 'justify'
          }
        },
        yAxis: {
          title: {
            text: 'Count'
          },
          labels: {
            formatter: function () { //todo..
              return this.value + '';
            }
          },
          minorGridLineWidth: 0,
          gridLineWidth: 0,
          alternateGridColor: null
        },
        tooltip: {
          crosshairs: true,
          shared: true
        },
        exporting: {
          enabled: false
        },
        plotOptions: {
          series: {
            color: '#FF0000'
          },
          spline: {
            radius: 4,
            lineWidth: 1,
            pointInterval: 3600000, // one hour
            marker: {
              enabled: false
            }
          }
        },
        series: datas,
        navigation: {
          menuItemStyle: {
            fontSize: '10px'
          }
        }
      });

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }

  public setCurrentSetting() {
    this.currentSettingEmitter.emit(this.setting);
  }

  public loadMap() {

    this.spinnerService.show();

    this.customReportService.getData(this.setting).subscribe((res: Response) => {
      let data: any[] = <any>res;

      var el: HTMLElement = this.graphComponent.nativeElement;
      el.innerHTML = "";

      let mapData = [];

      for (let i = 0; i < data.length - 1; i++) {
        let val = parseInt(data[i][1]);
        mapData.push({
          'key': data[i][0].toLowerCase(),
          'value': val
        });

      }

      let width = this.setting.config["width"];
      let height = this.setting.config["height"] - 50;

      jQuery(el).highcharts('Map', {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          renderTo: el,
          spacingBottom: 3,
          spacingTop: 3,
          spacingLeft: 3,
          spacingRight: 3,
          // Explicitly tell the width and height of a chart
          width: width,
          height: height
        },
        title: {
          text: null
        },

        mapNavigation: {
          enabled: true
        },

        colorAxis: {
          min: 0,
          stops: [
            [0, '#EFEFFF'],
            [0.5, Highcharts.getOptions().colors[0]],
            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
          ]
        },

        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'bottom'
        },
        exporting: {
          enabled: false
        },
        series: [{
          data: mapData,
          mapData: Highcharts.maps['custom/world'],
          joinBy: ['hc-key', 'key'],
          name: 'Count',
          states: {
            hover: {
              color: Highcharts.getOptions().colors[2]
            }
          },
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            format: '{point.code}'
          },
          point: {
            events: {
              // On click, look for a detailed map
              click: function () {
                var key = this.key;
                jQuery('#mapDropdown option').each(function () {
                  if (this.value === 'countries/' + key.substr(0, 2) + '/' + key + '-all.js') {
                    jQuery('#mapDropdown').val(this.value).change();
                  }
                });
              }
            }
          }
        }, {
          type: 'mapline',
          name: "Separators",
          data: [],
          nullColor: 'gray',
          showInLegend: true,
          enableMouseTracking: false
        }]
      });

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );

  }


  public initGrid(gridData: any, gridstack: ElementRef) {

    this.gridstack = gridstack;

    let node = {
      x: this.setting.config["x"],
      y: this.setting.config["y"],
      col: this.setting.config["col"],
      row: this.setting.config["row"]
    };

    gridData.addWidget(this.el.nativeElement, node.x, node.y, node.col, node.row);

    jQuery(this.el.nativeElement).on('resizestop', (event, ui) => {
      var grid = jQuery(this.el.nativeElement);
      var element = event.target;
      this.setting.config["width"] = ui.size.width;
      this.setting.config["height"] = ui.size.height;

      this.setting.config["col"] = grid.attr("data-gs-width");
      this.setting.config["row"] = grid.attr("data-gs-height");
      this.setting.config["x"] = grid.attr("data-gs-x");
      this.setting.config["y"] = grid.attr("data-gs-y");

      this.settingConfigUpdateEmitter.emit(this.setting);

      this.createChart();


      /*

       var node = jQuery(element).data('_gridstack_node');
       if (typeof node == 'undefined')
       return;

       this.setting.config["col"]=jQuery(alo).attr("data-gs-width");
       this.setting.config["row"]=jQuery(alo).attr("data-gs-height");
       this.setting.config["x"]=jQuery(alo).attr("data-gs-x");
       this.setting.config["y"]=jQuery(alo).attr("data-gs-y");

       */
      //  gridData.update(grid, this.setting.config.x, this.setting.config.y, this.setting.config.col, this.setting.config.row);

      // this.renderer.setElementAttribute(this.el.nativeElement, 'data-gs-height', "12");
      //            this.renderer.setElementAttribute(this.el.nativeElement, 'data-gs-width', "8");

      //  jQuery(this.gridstack.nativeElement).find(".grid-stack-placeholder").attr('data-gs-height', targetHeight);

      //  jQuery(this.el.nativeElement).attr('data-gs-height', targetHeight);
      //  jQuery(this.el.nativeElement).attr('data-gs-width', targetwidth);


      // gridData.update(this.el.nativeElement, node.x, node.y, node.width, node.height);
    });

    jQuery(this.el.nativeElement).draggable({
      handle: '.title',
      scroll: true,
      appendTo: 'body'
    });

    this.createChart();
  }


  public updateConfigPositions() {
    let alo = this.el.nativeElement;
    this.setting.config["col"] = jQuery(alo).attr("data-gs-width");
    this.setting.config["row"] = jQuery(alo).attr("data-gs-height");
    this.setting.config["x"] = jQuery(alo).attr("data-gs-x");
    this.setting.config["y"] = jQuery(alo).attr("data-gs-y");

    return this.setting;
  }


}
