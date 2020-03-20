import { OnInit, Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/monitorService';
import { Subject } from 'rxjs';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';
import { ExcelService } from 'src/app/core/services/excelService';
import { PdfService } from 'src/app/core/services/pdfService';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';
import { RkTableConfigModel, RkTableRowModel, RkTableColumnModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { ExportTypes } from 'roksit-lib/lib/modules/rk-table/rk-table-export/rk-table-export.component';
import * as moment from 'moment';

export interface LinkClick {
  columnModel: RkTableColumnModel;
  value: string;
}

@Component({
  selector: 'app-monitor-result',
  templateUrl: 'monitor-result.component.html',
  styleUrls: ['monitor-result.component.css'],
  providers: [CountryPipe, MacAddressFormatterPipe]
})
export class MonitorResultComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private monitorService: MonitorService,
    private excelService: ExcelService,
    private pdfService: PdfService
  ) { }

  currentPage = 1;
  columns: LogColumn[];
  selectedColumns: LogColumn[];
  tableData: any;
  total = 0;
  multiplier = 1;
  maxSize = 10;
  private ngUnsubscribe: Subject<any> = new Subject<any>();
  columnListLength = 12;

  pageViewCount = 10;

  totalCount = 0;

  tableConfig: RkTableConfigModel = {
    columns: [
      { id: 0, name: 'time', displayText: 'Time', isLink: true },
      { id: 1, name: 'domain', displayText: 'Domain', isLink: true },
      { id: 2, name: 'subdomain', displayText: 'Subdomain', isLink: true },
      { id: 3, name: 'sourceIp', displayText: 'Src.Ip', isLink: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: 'Src. Country', isLink: true },
      { id: 5, name: 'destinationIp', displayText: 'Dst.Ip', isLink: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: 'Dst.Country', isLink: true },
      { id: 7, name: 'agentAlias', displayText: 'Location/Agent', isLink: true },
      { id: 8, name: 'userId', displayText: 'User Id', isLink: true },
      { id: 9, name: 'action', displayText: 'Action', isLink: true },
      { id: 10, name: 'applicationName', displayText: 'Application', isLink: true },
      { id: 11, name: 'category', displayText: 'Category', isLink: true },
      { id: 12, name: 'reason', displayText: 'Reason', isLink: true },
      { id: 13, name: 'clientLocalIp', displayText: 'Local Src. Ip', isLink: true },
      { id: 14, name: 'clientMacAddress', displayText: 'Mac Address', isLink: true },
      { id: 15, name: 'clientBoxSerial', displayText: 'Box Serial', isLink: true },
      { id: 16, name: 'hostName', displayText: 'Host Name', isLink: true }
    ],
    rows: [],
    selectableRows: true
  };

  @Input() public searchSetting: SearchSetting;

  @Output() public addColumnValueEmitter = new EventEmitter();

  @Output() public tableColumnsChanged = new EventEmitter();

  @Output() linkClickedOutput = new EventEmitter<LinkClick>();

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    this.monitorService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;

      this.tableColumnsChanged.next();

      const tempcolumns = [];

      for (const data of this.columns) {
        if (data['checked']) {
          tempcolumns.push(data);
        }
      }

      this.selectedColumns = tempcolumns;

      this.selectedColumns.forEach(item => {
        const col = this.tableConfig.columns.find(colItem => colItem.name === item.name);

        if (col) {
          col.selected = true;
        }
      });
    });
    this.loadGraph(this.searchSetting);
  }

  refresh(searchSettings: SearchSetting) {
    this.loadGraph(searchSettings);
  }

  exportAs(extention: ExportTypes) {
    if (this.tableData && this.tableData.length > 0) {
      this.tableData.forEach(data => {
        delete data.id;
      });

      const d = new Date();

      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(this.tableData, 'MonitorReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      } else if (extention === 'pdf') {
        this.pdfService.exportAsPdfFile('landscape', this.tableData, 'MonitorReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }

  public loadGraph(searchSettings: SearchSetting) {
    this.monitorService.getGraphData(searchSettings, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: Response) => {
        if (res['result'] || res['total']) {
          this.tableData = res['result'];
          this.totalCount = res['total'];
        }

        this.tableConfig.rows = [];

        this.tableData.forEach(item => {
          item.time = moment(item.time).format('DD.MM.YYYY HH:mm:ss');

          const rowItem: RkTableRowModel = item;
          rowItem.selected = false;

          rowItem['action'] = rowItem['action'] === true ? 'Allow' : 'Deny';

          rowItem['category'] = typeof rowItem['category'] === 'object' ? rowItem['category'].join(',') : rowItem['category'];

          this.tableConfig.rows.push(rowItem);
        });
      });
  }

  public checkUncheckColumn(col: LogColumn) {
    let found = false;

    for (const a of this.columns) {
      if (a.name === col.name) {
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
      for (const a of this.selectedColumns) {
        if (a.name === column.name) {
          const cindex = this.selectedColumns.indexOf(a);
          this.selectedColumns.splice(cindex, 1);
          break;
        }
      }
    }
  }

  changeColumnListLength() {
    if (this.columnListLength === 12) {
      this.columnListLength = this.columns.length;
    } else {
      this.columnListLength = 12;
    }
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;

    this.loadGraph(this.searchSetting);
  }

  public addColumnValueIntoSelectedValues(column: any, xx: any) {
    this.addColumnValueEmitter.emit({ column: column, data: xx }); // How to pass the params event and ui...?
  }

  onPageChange(pageNumber: number) {
    this.pageChanged({ page: pageNumber });
  }

  onPageViewCountChange(event: number) {
    this.searchSetting.topNumber = event;

    this.refresh(this.searchSetting);
  }

  linkClicked($event: LinkClick) {
    this.linkClickedOutput.emit($event);
  }
}
