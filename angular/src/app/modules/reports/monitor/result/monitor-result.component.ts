import { OnInit, Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
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
import { ReportService } from 'src/app/core/services/reportService';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { TranslateService } from '@ngx-translate/core';

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
export class MonitorResultComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  constructor(
    private monitorService: MonitorService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private reportService: ReportService,
    private translateService: TranslatorService,
    private _translateService: TranslateService
  ) {
    _translateService.onLangChange.subscribe(result => {
      this.changeColumnNames();
    });
  }

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

  tableHeight = window.innerWidth > 768 ? (window.innerHeight - 373) - (document.body.scrollHeight - document.body.clientHeight) : null;

  tableConfig: RkTableConfigModel = {
    columns: [
      { id: 0, name: 'time', displayText: this.translateService.translate('TableColumn.Time'), isLink: true },
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), isLink: true },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), isLink: true },
      { id: 3, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), isLink: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), isLink: true },
      { id: 5, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), isLink: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), isLink: true },
      { id: 7, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), isLink: true },
      { id: 8, name: 'userId', displayText: this.translateService.translate('TableColumn.UserId'), isLink: true },
      { id: 9, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), isLink: true },
      { id: 10, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), isLink: true },
      { id: 11, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), isLink: true },
      { id: 12, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), isLink: true },
      { id: 13, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), isLink: true },
      { id: 14, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), isLink: true },
      { id: 15, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), isLink: true },
      { id: 16, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true },

    ],
    rows: [],
    selectableRows: true,
    url: 'http://beta.cyber-xray.com/#/anonymous-admin/dashboard/'
  };

  @Input() public searchSetting: SearchSetting;

  currentPage = 1;

  @Output() public addColumnValueEmitter = new EventEmitter();

  @Output() public tableColumnsChanged = new EventEmitter();

  @Output() linkClickedOutput = new EventEmitter<LinkClick>();

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {

  }

  ngAfterViewInit() {
    this.reportService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;

      this.tableColumnsChanged.next();

      const tempcolumns = [];

      for (const data of this.columns) {
        console.log('data', data);
        if (data['checked']) {
          tempcolumns.push(data);
        }
      }

      this.selectedColumns = tempcolumns;

      this.selectedColumns.forEach(item => {
        const col = this.tableConfig.columns.find(colItem => colItem.name === item.name);
        console.log('item: ', item);
        if (col) {
          col.selected = true;
        }
      });
      console.log(this.selectedColumns);
    });
    this.loadGraph(this.searchSetting);
  }

  private changeColumnNames() {
    this.tableConfig.columns = [
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), isLink: true },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), isLink: true },
      { id: 3, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), isLink: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), isLink: true },
      { id: 5, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), isLink: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), isLink: true },
      { id: 7, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), isLink: true },
      { id: 8, name: 'userId', displayText: this.translateService.translate('TableColumn.UserId'), isLink: true },
      { id: 9, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), isLink: true },
      { id: 10, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), isLink: true },
      { id: 11, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), isLink: true },
      { id: 12, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), isLink: true },
      { id: 13, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), isLink: true },
      { id: 14, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), isLink: true },
      { id: 15, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), isLink: true },
      { id: 16, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true },
      { id: 17, name: 'icon', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true }
    ];
  }

  refresh(searchSettings: SearchSetting) {
    this.loadGraph(searchSettings);
  }

  exportAs(extention: ExportTypes) {
    if (this.tableData && this.tableData.length > 0) {
      let tableData = JSON.parse(JSON.stringify(this.tableData)) as any[];

      tableData = tableData.filter(x => x.selected);

      if (tableData.length === 0) {
        tableData = JSON.parse(JSON.stringify(this.tableData)) as any[];
      }

      tableData.forEach(data => {
        delete data.id;
      });

      const d = new Date();

      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(tableData, 'MonitorReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      } else if (extention === 'pdf') {
        this.pdfService.exportAsPdfFile('landscape', tableData, 'MonitorReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }

  public loadGraph(searchSettings: SearchSetting) {
    this.monitorService.getData(searchSettings, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: Response) => {
        if (res['result'] || res['total']) {
          this.tableData = res['result'];
          this.totalCount = res['total'];
        }

        this.tableConfig.rows = [];

        this.tableData.forEach(item => {
          // burasi degisirse fillSearchSettingsByFilters bu fonksiyon icindeki yere bak

          item.time = moment(item.time).format('YYYY-MM-DD HH:mm:ss');

          const rowItem: RkTableRowModel = item;

          rowItem.imgOptions = {src:'../../../../../assets/img/question.jpeg', columnName:'domain',isNavigate:true,customClass:'navigate-icon'};
          rowItem.selected = false;

          rowItem['action'] = rowItem['action'] === true ? 'Allow' : 'Deny';

          rowItem['category'] = typeof rowItem['category'] === 'object' ? rowItem['category'].join(',') : rowItem['category'];

          this.tableConfig.rows.push(rowItem);
        });
        this.tableHeight = window.innerWidth > 768 ? (window.innerHeight - 373) - (document.body.scrollHeight - document.body.clientHeight) : null;
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
