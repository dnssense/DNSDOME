import { ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js'
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ExcelService } from 'src/app/core/services/ExcelService';
import { PdfService } from 'src/app/core/services/PdfService';

@Component({
  selector: 'app-customreport-result',
  templateUrl: 'customreport-result.component.html',
  styleUrls: ['customreport-result.component.css']
})
export class CustomReportResultComponent implements OnDestroy {
  elementRef: ElementRef;
  public date = new Date();
  public loading: boolean = false;
  public selectedColumns: AggregationItem[];

  @Input() public searchSetting: SearchSetting;
  @Input() public data: any[];
  @Input() public total: number = 0;
  @Input() public multiplier: number = 1;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public searchEmitter = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(private customReportService: CustomReportService, private fastReportService: FastReportService,
    private excelService: ExcelService, private pdfService: PdfService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  public setTopCount(value) {
    this.searchSetting.topNumber = value;
    this.searchEmitter.emit(this.searchSetting);

  }

  public addValuesIntoSelected(value) {
    this.addColumnValueEmitter.emit(value);
  }

  public updateSearchSetting(setting: SearchSetting) {
    this.searchSetting = setting;
  }

  refresh() {
    this.search(this.searchSetting);
  }

  public search(searchSetting: SearchSetting) {

    this.drawChart(searchSetting);

    this.customReportService.getData(searchSetting).takeUntil(this.ngUnsubscribe).subscribe((res: Response) => {

      if (res['searchSetting'] != null) {
        this.searchSetting = res['searchSetting'];
      }

      let total = 0;
      let data: any = res;
      this.selectedColumns = <AggregationItem[]>JSON.parse(JSON.stringify(searchSetting.columns.columns));

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][this.selectedColumns.length]);
          total += val;
        }

        var maxPercentage = 0;
        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][this.selectedColumns.length]);
          let tempPercentage = val * 1.0 / total;
          if (tempPercentage > maxPercentage) {
            maxPercentage = tempPercentage;
          }
        }
        let multiplier = Math.floor(100 / (maxPercentage * 100));

        this.multiplier = multiplier;
        this.total = total;

      }
      this.data = data;

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );

  }

  drawChart(settings: SearchSetting) {

    this.fastReportService.loadHistogram(settings).subscribe((res: any[]) => {
      let data: any[] = res;

      if (data) {
        var labelArray = [];
        let chartSeries = [];
        for (let i = 0; i < data.length; i++) {
          const d = new Date(data[i].date);
          labelArray.push(d.getHours() + ":" + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()))
          chartSeries.push(data[i].value)
        }

        var options = {
          chart: { height: 300, type: 'line', zoom: { enabled: false }, foreColor: '#9b9b9b', toolbar: { show: false, tools: { download: false } }, },
          dataLabels: { enabled: false },
          stroke: { width: 3, curve: 'smooth' },
          colors: ['#9d60fb'],
          series: [{ name: "Hits", data: [[]] }],
          markers: { size: 0, hover: { sizeOffset: 6 } },
          xaxis: { categories: labelArray, labels: { minHeight: 20 } },
          tooltip: { theme: 'dark' },
          grid: { borderColor: '#626262', strokeDashArray: 6, },
          legend: { show: false },
          annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
          title: { text: 'Log Histogram', style: { fontSize: '20px', color: '#eeeeee' } }
        }

        var logChart = new ApexCharts(document.querySelector("#customReportChart"), options);
        logChart.render();
        logChart.updateSeries([{ name: "Hits", data: chartSeries }])
      }

    });
  }

  exportAs(extention: string) {
    if (this.data && this.data.length > 0) {
      let jsonString = "[";
      for (let i = 0; i < this.data.length - 1; i++) {
        const d = this.data[i];
        jsonString += "{"
        for (let j = 0; j < d.length - 1; j++) {
          const e = d[j];
          jsonString += '"' + this.selectedColumns[j].label + '" : "' + e + '",';
        }
        jsonString += '"Count": "' + d[d.length - 1] + '" },'
      }
      jsonString = jsonString.substr(0, jsonString.length - 1);
      jsonString += "]"

      const d = new Date();
      if (extention == 'xlsx') {
        this.excelService.exportAsExcelFile(JSON.parse(jsonString), 'CustomReport-' + d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear());
      } else if ('pdf') {
        this.pdfService.exportAsPdfFile("landscape", JSON.parse(jsonString), 'CustomReport-' + d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear());
      }
    }
  }

  public stopRefreshing() {
    //this.spinnerService.stop();
  }
}
