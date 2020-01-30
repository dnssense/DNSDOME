import { OnInit, Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/MonitorService';
import { Subject } from 'rxjs';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';
import { ExcelService } from 'src/app/core/services/ExcelService';
import { PdfService } from 'src/app/core/services/PdfService';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';
import { RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';


@Component({
  selector: 'app-monitor-result',
  templateUrl: 'monitor-result.component.html',
  styleUrls: ['monitor-result.component.css'],
  providers: [CountryPipe, MacAddressFormatterPipe]
})
export class MonitorResultComponent implements OnInit, AfterViewInit, OnDestroy {
  public totalItems: number = 0;
  public currentPage: number = 1;
  public columns: LogColumn[];
  public selectedColumns: LogColumn[];
  public tableData: any;
  public total: number = 0;
  public multiplier = 1;
  public maxSize: number = 10;
  private ngUnsubscribe: Subject<any> = new Subject<any>();
  columnListLength: number = 12;

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


  @Input() public searchSetting: SearchSetting;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public tableColumnsChanged = new EventEmitter();

  @ViewChild('tableDivComponent', { static: false }) tableDivComponent: ElementRef;
  @ViewChild('columnTablePanel', { static: false }) columnTablePanel: any;

  constructor(private monitorService: MonitorService, private excelService: ExcelService, private pdfService: PdfService) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    this.monitorService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;
      

      this.tableColumnsChanged.next();

      var tempcolumns = [];
      for (let data of this.columns) {
        if (data["checked"]) {
          tempcolumns.push(data);
        }
      }

      this.selectedColumns = tempcolumns;

      

      this.selectedColumns.forEach(item => {
        let col = this.tableConfig.columns.find(colItem => colItem.name == item.name);

        if (col)
          col.selected = true;
      });
    });
    this.loadGraph(this.searchSetting);
  }

  refresh(ss: SearchSetting) {
    this.loadGraph(ss);
  }

  public stopRefreshing() {
    // this.spinnerService.stop();
  }

  exportAs(extention: string) {

    if (this.tableData && this.tableData.length > 0) {
      this.tableData.forEach(d => {
        delete d.id;
      });
      const d = new Date();

      if (extention == 'xlsx') {
        this.excelService.exportAsExcelFile(this.tableData, 'MonitorReport-' + d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear());
      } else if (extention == 'pdf') {
        this.pdfService.exportAsPdfFile("landscape", this.tableData, 'MonitorReport-' + d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear());
      }
    }

  }

  public loadGraph(ss: SearchSetting) {
    // this.spinnerService.start();
    this.monitorService.getGraphData(ss, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: Response) => {
        this.tableData = res['result']; this.totalItems = res['total'];

        this.tableConfig.rows = [];

        
        this.tableData.forEach(item => {
          let rowItem: RkTableRowModel = item;
          rowItem.selected = false;

          this.tableConfig.rows.push(rowItem);
        });
      },
        () => this.stopRefreshing(), () => this.stopRefreshing());
  }

  public checkUncheckColumn(col: LogColumn) {
    let found = false;
    for (let a of this.columns) {
      if (a.name == col.name) {
        found = true;
        col.checked = !a.checked;
        a.checked = col.checked;
        break;
      }
    }
    this.inputChecked(col);
  }

  public inputChecked(column: LogColumn) {
    if (column.checked) {
      this.selectedColumns.push(column);
    } else {
      for (let a of this.selectedColumns) {
        if (a.name == column.name) {
          let cindex = this.selectedColumns.indexOf(a);
          this.selectedColumns.splice(cindex, 1);
          break;
        }
      }
    }
  }

  changeColumnListLength() {
    if (this.columnListLength == 12) {
      this.columnListLength = this.columns.length;
    } else {
      this.columnListLength = 12;
    }

  }
  // public setTopCount(value) {
  //   this.searchSetting.topNumber = value;
  // //checkUncheckColumn   this.loadGraph();
  // }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.loadGraph(this.searchSetting);
  };

  public addColumnValueIntoSelectedValues(column: any, xx: any) {
    this.addColumnValueEmitter.emit({ column: column, data: xx }); // How to pass the params event and ui...?
  }

  // public changeColumns($event) {
  //   //you may implement here...
  // }

  onPageChange(pageNumber: number) {
    this.pageChanged({ page: pageNumber });
  }

  onPageViewCountChange(event: any) {

  }
}
