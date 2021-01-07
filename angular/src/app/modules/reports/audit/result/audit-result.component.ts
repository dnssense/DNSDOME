import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ExportTypes } from 'roksit-lib/lib/modules/rk-table/rk-table-export/rk-table-export.component';
import { RkTableColumnModel, RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { Subject } from 'rxjs';
import { AuditData, AuditResponse } from 'src/app/core/models/AuditSearch';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { AuditService } from 'src/app/core/services/auditService';
import { ExcelService } from 'src/app/core/services/excelService';
import { PdfService } from 'src/app/core/services/pdfService';
import { ReportService } from 'src/app/core/services/reportService';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';

export interface LinkClick {
  columnModel: RkTableColumnModel;
  value: string;
}

@Component({
  selector: 'app-audit-result',
  templateUrl: 'audit-result.component.html',
  styleUrls: ['audit-result.component.css'],
  providers: [CountryPipe, MacAddressFormatterPipe]
})
export class AuditResultComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  constructor(
    private auditService: AuditService,
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
      { id: 0, name: 'time', displayText: this.translateService.translate('AuditTableColumn.Time'), isLink: true },
      { id: 1, name: 'username', displayText: this.translateService.translate('AuditTableColumn.Username'), isLink: true },
      { id: 2, name: 'isApiKey', displayText: this.translateService.translate('AuditTableColumn.IsApiKey'), isLink: true },
      { id: 3, name: 'ip', displayText: this.translateService.translate('AuditTableColumn.Ip'), isLink: true },
      { id: 4, name: 'severity', displayText: this.translateService.translate('AuditTableColumn.Severity'), isLink: true },
      { id: 5, name: 'message', displayText: this.translateService.translate('AuditTableColumn.Message'), isLink: true },
      { id: 6, name: 'messageDetail', displayText: this.translateService.translate('AuditTableColumn.MessageDetail'), isLink: false, isPopover: true },
    ],
    rows: [],
    selectableRows: true
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
    this.auditService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
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

  private changeColumnNames() {
    this.tableConfig.columns = [
      { id: 1, name: 'username', displayText: this.translateService.translate('AuditTableColumn.Username'), isLink: true },
      { id: 2, name: 'isApiKey', displayText: this.translateService.translate('AuditTableColumn.IsApiKey'), isLink: true },
      { id: 3, name: 'ip', displayText: this.translateService.translate('AuditTableColumn.Ip'), isLink: true },
      { id: 4, name: 'severity', displayText: this.translateService.translate('AuditTableColumn.Severity'), isLink: true },
      { id: 5, name: 'message', displayText: this.translateService.translate('AuditTableColumn.Message'), isLink: true },
      { id: 6, name: 'messageDetail', displayText: this.translateService.translate('AuditTableColumn.MessageDetail'), isLink: false },
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
        this.excelService.exportAsExcelFile(tableData, 'AuditReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      } else if (extention === 'pdf') {
        this.pdfService.exportAsPdfFile('landscape', tableData, 'AuditReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }


  public loadGraph(searchSettings: SearchSetting) {
    this.auditService.getData(searchSettings, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: AuditResponse) => {
        if (res['result'] || res['total']) {
          this.tableData = res['result'];
          this.totalCount = res['total'];
        }

        this.tableConfig.rows = [];
        this.tableConfig.arrowVisible = true;

        this.tableData.forEach(item => {
          // burasi degisirse fillSearchSettingsByFilters bu fonksiyon icindeki yere bak

          item.time = moment(item.insertDate).format('YYYY-MM-DD HH:mm:ss');

          const rowItem: RkTableRowModel = item;
          rowItem.selected = false;
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
