import { ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js'
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ExcelService } from 'src/app/core/services/ExcelService';
import { PdfService } from 'src/app/core/services/PdfService';
import { RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';

declare var moment: any;
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

  //@Input() public searchSetting: SearchSetting;
  public ss: SearchSetting
  @Input() set searchSetting(value: SearchSetting) {
    this.ss = value;
  };
  get searchSetting(): SearchSetting {
    return this.ss;
  }
  @Input() public data: any[];
  @Input() public total: number = 0;
  @Input() public multiplier: number = 1;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public searchEmitter = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  private ngUnsubscribe: Subject<any> = new Subject<any>();


  
  tableConfig: RkTableConfigModel = {
    columns: [
      { id: 0, name: 'time', displayText: 'Time' },
      { id: 1, name: 'domain', displayText: 'Domain' },
      { id: 2, name: 'subdomain', displayText: 'Subdomain' },
      { id: 3, name: 'sourceIp', displayText: 'Src.Ip' },
      { id: 4, name: 'sourceIpCountryCode', displayText: 'Src. Country' },
      { id: 5, name: 'destinationIp', displayText: 'Dst.Ip' },
      { id: 6, name: 'destinationIpCountryCode', displayText: 'Dst.Country' },
      { id: 7, name: 'agentAlias', displayText: 'Location/Agent' },
      { id: 8, name: 'userId', displayText: 'User Id' },
      { id: 9, name: 'action', displayText: 'Action' },
      { id: 10, name: 'applicationName', displayText: 'Application' },
      { id: 11, name: 'category', displayText: 'Category' },
      { id: 12, name: 'reason', displayText: 'Reason' },
      { id: 13, name: 'clientLocalIp', displayText: 'Local Src. Ip' },
      { id: 14, name: 'clientMacAddress', displayText: 'Mac Address' },
      { id: 15, name: 'clientBoxSerial', displayText: 'Box Serial' },
      { id: 16, name: 'hostName', displayText: 'Host Name' }
    ],
    rows: [

    ],
    selectableRows: true
  };


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
    this.firstDate = searchSetting.dateInterval;
    // this.drawChart(searchSetting);
    this.fillResultTable(searchSetting);
  }

  fillResultTable(searchSetting: SearchSetting) {
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

      this.tableConfig.columns.forEach(col => {
        let selectedCol = this.selectedColumns.find(item => item.column.name == col.name);

        col.selected = !!selectedCol;
      });

      this.data.forEach(item => {
        let rowItem: RkTableRowModel = { selected : false };

        this.selectedColumns.forEach((selectedCol, index) => {
          rowItem[selectedCol.column.name] = item[index];
        }); 

        this.tableConfig.rows.push(rowItem);
      });

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );
  }

  onPageChange(pageNumber: number) {
    // this.pageChanged({ page: pageNumber });
  }

  onPageViewCountChange(pageViewCount: number) {
    this.searchSetting.topNumber = pageViewCount;

    this.refresh();
  }

  drawChart(settings: SearchSetting) {

    this.fastReportService.loadHistogram(settings).subscribe((res: any[]) => {
      

      let data: any[] = res;
      if (data) {
        let labelArray = [];
        let chartSeries = [];
        for (let i = 0; i < data.length; i++) {
          const d = new Date(data[i].date);
          labelArray.push(moment(d).format('YYYY-MM-DDTHH:mm:ss.sssZ'))
          chartSeries.push(data[i].value)
        }

        var options = {
          chart: {
            height: 300, type: 'area', foreColor: '#ababab',
            toolbar: {
              tools:{
                download:false,
                pan:false
              }
            },
            events: {
              zoomed: (chartContext, { xaxis, yaxis }) => {
                this.updateResultTable(xaxis.min, xaxis.max);
              }
            }
          },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
          markers: { size: 0, hover: { sizeOffset: 5 } },
          series: [{ name: "Hits", data: [[]] }],
          xaxis: { type: 'datetime', categories: labelArray, tickAmount: 1, style: { color: '#f0f0f0' } },
          tooltip: { x: { format: 'dd/MM/yy HH:mm:ss' }, theme: 'dark' },
          grid: { borderColor: '#626262' },
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

  firstDate: any;
  updateResultTable(min: any, max: any): void {
    
    if (min && max) {
      let md = new Date(min);
      md.setHours(md.getUTCHours());
      md.setDate(md.getUTCDate());

      let mxd = new Date(max);
      mxd.setHours(mxd.getUTCHours());
      mxd.setDate(mxd.getUTCDate());

      let startDate = moment(md).format('DD.MM.YYYY HH:mm:ss');
      let endDate = moment(mxd).format('DD.MM.YYYY HH:mm:ss');

      const dateVal = startDate + ' - ' + endDate; 
      this.searchSetting.dateInterval = dateVal;
      this.fillResultTable(this.searchSetting);
    } else {
      this.searchSetting.dateInterval = this.firstDate;
      this.fillResultTable(this.searchSetting);
    }

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
