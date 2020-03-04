import { ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ExcelService } from 'src/app/core/services/ExcelService';
import { PdfService } from 'src/app/core/services/PdfService';
import { RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { ExportTypes } from 'roksit-lib/lib/modules/rk-table/rk-table-export/rk-table-export.component';
import { LinkClick } from '../../monitor/result/monitor-result.component';

declare var moment: any;

export interface TableBadgeOutput {
  name: string;
  value: boolean;
}

@Component({
  selector: 'app-customreport-result',
  templateUrl: 'customreport-result.component.html',
  styleUrls: ['customreport-result.component.css']
})
export class CustomReportResultComponent implements OnDestroy {

  constructor(
    private customReportService: CustomReportService,
    private fastReportService: FastReportService,
    private excelService: ExcelService,
    private pdfService: PdfService
  ) { }

  elementRef: ElementRef;
  public date = new Date();
  public loading = false;
  public selectedColumns: AggregationItem[];

  @Input() set searchSetting(value: SearchSetting) {
    this.ss = value;
  }
  get searchSetting(): SearchSetting {
    return this.ss;
  }


  @Output() linkClickedOutput = new EventEmitter<LinkClick>();

  public ss: SearchSetting;

  @Input() public data: any[];
  @Input() public total = 0;
  @Input() public multiplier = 1;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public searchEmitter = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  tableConfig: RkTableConfigModel = {
    columns: [
      { id: 0, name: 'time', displayText: 'Time', isLink: true },
      { id: 1, name: 'domain', displayText: 'Domain', isLink: true },
      { id: 2, name: 'subdomain', displayText: 'Subdomain', isLink: true },
      { id: 3, name: 'sourceIp', displayText: 'Src.Ip', isLink: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: 'Src. Country' },
      { id: 5, name: 'destinationIp', displayText: 'Dst.Ip', isLink: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: 'Dst.Country', isLink: true },
      { id: 7, name: 'agentAlias', displayText: 'Location/Agent' },
      { id: 8, name: 'userId', displayText: 'User Id' },
      { id: 9, name: 'action', displayText: 'Action' },
      { id: 10, name: 'applicationName', displayText: 'Application', isLink: true },
      { id: 11, name: 'category', displayText: 'Category', isLink: true },
      { id: 12, name: 'reason', displayText: 'Reason' },
      { id: 13, name: 'clientLocalIp', displayText: 'Local Src. Ip', isLink: true },
      { id: 14, name: 'clientMacAddress', displayText: 'Mac Address' },
      { id: 15, name: 'clientBoxSerial', displayText: 'Box Serial' },
      { id: 16, name: 'hostName', displayText: 'Host Name' }
    ],
    rows: [],
    selectableRows: true
  };

  firstDate: any;

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
    this.firstDate = searchSetting.dateInterval;
    this.fillResultTable(searchSetting);
  }

  fillResultTable(searchSetting: SearchSetting) {
    this.customReportService.getData(searchSetting).takeUntil(this.ngUnsubscribe).subscribe((res: Response) => {
      if (res['searchSetting'] != null) {
        this.searchSetting = res['searchSetting'];
      }

      this.drawChart(searchSetting);

      let total = 0;
      const data: any = res;

      this.selectedColumns = <AggregationItem[]>JSON.parse(JSON.stringify(searchSetting.columns.columns));

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const val = parseInt(data[i][this.selectedColumns.length], null);
          total += val;
        }
        let maxPercentage = 0;
        for (let i = 0; i < data.length; i++) {
          const val = parseInt(data[i][this.selectedColumns.length], null);
          const tempPercentage = val * 1.0 / total;
          if (tempPercentage > maxPercentage) {
            maxPercentage = tempPercentage;
          }
        }
        const multiplier = Math.floor(100 / (maxPercentage * 100));
        this.multiplier = multiplier;
        this.total = total;
      }

      this.data = data;

      this.tableConfig.columns.forEach(col => {
        const selectedCol = this.selectedColumns.find(item => item.column.name === col.name);

        col.selected = !!selectedCol;
      });

      this.data.forEach(item => {
        const rowItem: RkTableRowModel = { selected: false };

        this.selectedColumns.forEach((selectedCol, index) => {
          rowItem[selectedCol.column.name] = item[index];
        });

        this.tableConfig.rows.push(rowItem);
      });
    });
  }

  onPageChange(pageNumber: number) {
    this.pageChanged({ page: pageNumber });
  }

  pageChanged(event: any): void {
    this.refresh();
  }

  onPageViewCountChange(pageViewCount: number) {
    this.searchSetting.topNumber = pageViewCount;

    this.refresh();
  }

  drawChart(settings: SearchSetting) {
    this.fastReportService.loadHistogram(settings).subscribe((res: any[]) => {

      const data: any[] = res;

      if (data) {
        const labelArray = [];
        const chartSeries = [];

        data.forEach(elem => {
          labelArray.push(moment(elem.date).format('YYYY-MM-DD HH:mm:ss'));
          chartSeries.push(elem.value);
        });

        const options = {
          chart: {
            height: 300, type: 'area', foreColor: '#898ea4',
            toolbar: {
              tools: {
                download: false,
                pan: false
              }
            },
          },
          colors: ['#2cd9c5'],
          fill: {
            colors: ['#2cd9c5'],
          },
          title: {
            text: 'Log Histogram',
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#898ea4'
            },
          },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
          markers: { size: 0, hover: { sizeOffset: 5 } },
          series: [{ name: 'Hits', data: [[]] }],
          xaxis: { type: 'datetime', categories: labelArray, tickAmount: 1, style: { color: '#e9ebf1' } },
          tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' } },
          grid: { borderColor: '#e9ebf1' },
          legend: { show: false },
          annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
          animations: { enabled: true }
        };

        const logChart = new ApexCharts(document.querySelector('#customReportChart'), options);

        logChart.render();
        logChart.updateSeries([{ name: 'Hits', data: chartSeries }]);
      }

    });
  }

  updateResultTable(min: any, max: any): void {
    if (min && max) {
      const md = new Date(min);
      md.setHours(md.getUTCHours());
      md.setDate(md.getUTCDate());

      const mxd = new Date(max);
      mxd.setHours(mxd.getUTCHours());
      mxd.setDate(mxd.getUTCDate());

      const startDate = moment(md).format('DD.MM.YYYY HH:mm:ss');
      const endDate = moment(mxd).format('DD.MM.YYYY HH:mm:ss');

      const dateVal = startDate + ' - ' + endDate;
      this.searchSetting.dateInterval = dateVal;
      this.fillResultTable(this.searchSetting);
    } else {
      this.searchSetting.dateInterval = this.firstDate;
      this.fillResultTable(this.searchSetting);
    }
  }

  exportAs(extention: ExportTypes) {
    if (this.data && this.data.length > 0) {
      let jsonString = '[';
      for (let i = 0; i < this.data.length - 1; i++) {
        const da = this.data[i];
        jsonString += '{';
        for (let j = 0; j < da.length - 1; j++) {
          const e = da[j];
          jsonString += '"' + this.selectedColumns[j].label + '" : "' + e + '",';
        }
        jsonString += '"Count": "' + da[da.length - 1] + '" },';
      }
      jsonString = jsonString.substr(0, jsonString.length - 1);
      jsonString += ']';

      const d = new Date();
      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(JSON.parse(jsonString), 'CustomReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      } else if (extention === 'pdf') {
        this.pdfService.exportAsPdfFile('landscape', JSON.parse(jsonString), 'CustomReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }

  linkClicked($event: LinkClick) {
    this.linkClickedOutput.emit($event);
  }

  columnChanged($event: TableBadgeOutput) {
    const columnIndex = this.selectedColumns.findIndex(x => x.column.name === $event.name);

    if ($event.value) {
      this.selectedColumns.push({
        column: {
          name: $event.name,
          beautyName: this.capitalize($event.name),
          hrType: '',
          aggsType: 'TERM',
          checked: true
        }, label: this.capitalize($event.name)
      } as AggregationItem);
    } else {
      if (columnIndex > -1) {
        this.selectedColumns.splice(columnIndex, 1);
      }
    }

    this.searchSetting.columns.columns = this.selectedColumns;
  }

  private capitalize(value: string): string {
    return value[0].toLocaleUpperCase() + value.substring(1);
  }
}
