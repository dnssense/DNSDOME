
import {takeUntil} from 'rxjs/operators';
import { OnInit, Component, Input, Output, EventEmitter, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/monitorService';
import { Subject } from 'rxjs';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';
import { ExcelService } from 'src/app/core/services/excelService';
import { PdfService } from 'src/app/core/services/pdfService';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';
import * as moment from 'moment';
import { ReportService } from 'src/app/core/services/reportService';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import * as punycode from 'punycode';
import { ConfigService } from '../../../../core/services/config.service';
import { CyberXRayService } from '../../../../core/services/cyberxray.service';
import { ExportTypes, RkTableConfigModel, RkTableRowModel, ActionClick } from 'roksit-lib';


@Component({
  selector: 'app-monitor-result',
  templateUrl: 'monitor-result.component.html',
  styleUrls: ['monitor-result.component.css'],
  providers: [CountryPipe, MacAddressFormatterPipe, MonitorService]
})
export class MonitorResultComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  constructor(
    private monitorService: MonitorService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private reportService: ReportService,
    private translateService: TranslatorService,
    private _translateService: TranslateService,
    private authService: AuthenticationService,
    private configService: ConfigService,
    private cyberxrayService: CyberXRayService
  ) {
  }

  token;
  refreshToken;

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
    copyText: {text: this.translateService.translate('Copy'), doneText: this.translateService.translate('Copied')},
    defaultActionText: {text: this.translateService.translate('AddToFilter'), doneText: this.translateService.translate('AddedToFilter')},
    filterColumnText: this.translateService.translate('ColumnsToDisplay'),
    cellDataMaxLen: 30,
    columns: [
      { id: 0, name: 'time', displayText: this.translateService.translate('TableColumn.Time'), showAction: true },
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), showAction: true, isPopover: true },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), showAction: true, isPopover: true},
      { id: 3, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), showAction: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), showAction: true },
      { id: 5, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), showAction: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), showAction: true },
      { id: 7, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), showAction: true },
      { id: 8, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), showAction: true },
      { id: 9, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), showAction: true },
      { id: 10, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), showAction: true },
      { id: 11, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), showAction: true },
      { id: 12, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), showAction: true },
      { id: 13, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), showAction: true },
      { id: 14, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), showAction: true },
      { id: 15, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), showAction: true },
      { id: 16, name: 'ruleNumber', displayText: this.translateService.translate('TableColumn.RuleNumber'), showAction: true },
      { id: 17, name: 'ruleBy', displayText: this.translateService.translate('TableColumn.RuleBy'), showAction: true, format: d => d?.substring(2) },
      { id: 18, name: 'ruleKeyword', displayText: this.translateService.translate('TableColumn.RuleKeyword'), showAction: true },

    ],
    rows: [],
    selectableRows: true,
  };

  @Input() public searchSetting: SearchSetting;

  currentPage = 1;

  @Output() public addColumnValueEmitter = new EventEmitter();

  @Output() public tableColumnsChanged = new EventEmitter();

  @Output() actionClickedOutput = new EventEmitter<ActionClick>();

  ngOnInit() {
    /*
    this._translateService.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.changeColumnNames();
    });*/
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  calculateAfterData() {

    this.tableHeight = window.innerWidth > 768 ? (window.innerHeight - 480) - (document.body.scrollHeight - document.body.clientHeight) : null;

  }

  ngAfterViewChecked() {

  }

  ngAfterViewInit() {
    this.reportService.initTableColumns().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: LogColumn[]) => {
      this.columns = res;

      this.tableColumnsChanged.next();

      const tempcolumns = [];

      for (const data of this.columns) {
        // console.log('data', data);
        if (data['checked']) {
          tempcolumns.push(data);
        }
      }

      this.selectedColumns = tempcolumns;

      this.selectedColumns.forEach(item => {
        const col = this.tableConfig.columns.find(colItem => colItem.name === item.name);
        // console.log('item: ', item);
        if (col) {
          col.selected = true;
        }
      });
      // console.log(this.selectedColumns);
    });
    this.loadGraph(this.searchSetting);
  }

  private changeColumnNames() {
    this.tableConfig.copyText = {text: this.translateService.translate('Copy'), doneText: this.translateService.translate('Copied')};
    this.tableConfig.defaultActionText = {text: this.translateService.translate('AddToFilter'), doneText: this.translateService.translate('AddedToFilter')};
    this.tableConfig.filterColumnText = this.translateService.translate('ColumnsToDisplay');
    this.tableConfig.columns = [
      { id: 0, name: 'time', displayText: this.translateService.translate('TableColumn.Time'), showAction: true },
      { id: 1, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), showAction: true },
      { id: 2, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), showAction: true },
      { id: 3, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), showAction: true },
      { id: 4, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), showAction: true },
      { id: 5, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), showAction: true },
      { id: 6, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), showAction: true },
      { id: 7, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), showAction: true },
      { id: 8, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), showAction: true, isPopover: true },
      { id: 9, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), showAction: true, isPopover: true},
      { id: 10, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), showAction: true },
      { id: 11, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), showAction: true },
      { id: 12, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), showAction: true },
      { id: 13, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), showAction: true },
      { id: 14, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), showAction: true },
      { id: 15, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), showAction: true },
      { id: 16, name: 'ruleNumber', displayText: this.translateService.translate('TableColumn.RuleNumber'), showAction: true },
      { id: 17, name: 'ruleBy', displayText: this.translateService.translate('TableColumn.RuleBy'), showAction: true, format: d => d?.substring(2) },
      { id: 18, name: 'ruleKeyword', displayText: this.translateService.translate('TableColumn.RuleKeyword'), showAction: true },
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

  configColumn;
  public loadGraph(searchSettings: SearchSetting) {
    this.monitorService.getData(searchSettings, this.currentPage).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: Response) => {
        if (res['result'] || res['total']) {
          this.tableData = res['result'];
          this.totalCount = res['total'];
        }

        this.tableConfig.rows = [];
        // add column headers
        this.tableConfig.headers = [
          { name: 'time', displayText: this.translateService.translate('TableColumn.Time'), columnName: ['time'] },
          {
            name: 'source', columnName:
              ['sourceIp', 'sourceIpCountryCode', 'agentAlias', 'clientLocalIp', 'hostName', 'clientMacAddress', 'clientBoxSerial'], displayText: this.translateService.translate('Source')
          },
          {
            name: 'destination', columnName:
              ['domain', 'subdomain', 'destinationIp', 'destinationIpCountryCode'], displayText: this.translateService.translate('Destination')
          },
          {
            name: 'decision', columnName:
              ['category', 'applicationName', 'action', 'reasonType', 'ruleNumber', 'ruleBy', 'ruleKeyword'], displayText: this.translateService.translate('Decision')
          }
        ];

        this.tableConfig.selectableRows = false;
        this.tableConfig.arrowVisible = true;

        this.configColumn = this.tableConfig.columns;
        this.changeColumnNames();
        this.columnSet();

        this.tableData.forEach(item => {
          // burasi degisirse fillSearchSettingsByFilters bu fonksiyon icindeki yere bak

          item.time = moment(item.time).format('YYYY-MM-DD HH:mm:ss');

          const rowItem: RkTableRowModel = item;

          rowItem.imgOptions = {
            src: '../../../../../assets/img/CyberxIcon.svg',
            columnName: 'domain',
            isNavigate: true,
            customClass: 'navigate-icon'
          };
          rowItem.selected = false;

          rowItem['action'] = rowItem['action'] === true ? 'Allow' : 'Deny';

          rowItem['category'] = typeof rowItem['category'] === 'object' ? rowItem['category'].join(',') : rowItem['category'];

          if ((rowItem['domain'] && rowItem['domain'] !== punycode.toUnicode(rowItem['domain']))) {
            rowItem.popoverRows = [{ domain: punycode.toUnicode(rowItem['domain'])}];
          } else if (rowItem['subdomain'] && rowItem['subdomain'] !== punycode.toUnicode(rowItem['subdomain'])) {
            rowItem.popoverRows = [{subdomain: punycode.toUnicode(rowItem['subdomain']) }];
          }

          this.tableConfig.rows.push(rowItem);
        });
        this.calculateAfterData();
      });
  }

  getNavigateByClickedDomain(domain) {
    this.cyberxrayService.open(domain);
  }

  columnSet() {
    for (const column of this.configColumn) {
      if (column.selected) {
        this.tableConfig.columns.forEach(col => {
          if (col.name === column.name) {
            col.selected = true;
          }
        });
      }
    }
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

  actionClicked($event: ActionClick) {
    this.actionClickedOutput.emit($event);
  }
}
