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
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import * as punycode from 'punycode';
import { ConfigHost, ConfigService } from '../../../../core/services/config.service';
import { CyberXRayService } from '../../../../core/services/cyberxray.service';

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
    private _translateService: TranslateService,
    private authService: AuthenticationService,
    private configService: ConfigService,
    private cyberxrayService: CyberXRayService
  ) {
    _translateService.onLangChange.subscribe(result => {
      this.changeColumnNames();
    });

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
    columns: [
      { id: 0, name: 'time', displayText: this.translateService.translate('TableColumn.Time'), isLink: true },
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
      { id: 3, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), isLink: true },
      { id: 4, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), isLink: true },
      { id: 5, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), isLink: true },
      { id: 6, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), isLink: true },
      { id: 7, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), isLink: true },
      // { id: 8, name: 'userId', displayText: this.translateService.translate('TableColumn.UserId'), isLink: true },
      { id: 8, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), isLink: true },
      { id: 9, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), isLink: true },
      { id: 10, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), isLink: true },
      { id: 11, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), isLink: true },
      { id: 12, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), isLink: true },
      { id: 13, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), isLink: true },
      { id: 14, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), isLink: true },
      { id: 15, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true },
      { id: 16, name: 'ruleNumber', displayText: this.translateService.translate('TableColumn.RuleNumber'), isLink: true },
      { id: 17, name: 'ruleBy', displayText: this.translateService.translate('TableColumn.RuleBy'), isLink: true, format: d => d?.substring(2) },
      { id: 18, name: 'ruleKeyword', displayText: this.translateService.translate('TableColumn.RuleKeyword'), isLink: true },

    ],
    rows: [],
    selectableRows: true,
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

  calculateAfterData() {

    this.tableHeight = window.innerWidth > 768 ? (window.innerHeight - 480) - (document.body.scrollHeight - document.body.clientHeight) : null;

  }

  ngAfterViewChecked() {

  }

  ngAfterViewInit() {
    this.reportService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
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
    this.tableConfig.columns = [
      { id: 0, name: 'time', displayText: this.translateService.translate('TableColumn.Time'), isLink: true },
      { id: 1, name: 'sourceIp', displayText: this.translateService.translate('TableColumn.SourceIp'), isLink: true },
      { id: 2, name: 'sourceIpCountryCode', displayText: this.translateService.translate('TableColumn.SourceCountry'), isLink: true },
      { id: 3, name: 'agentAlias', displayText: this.translateService.translate('TableColumn.AgentAlias'), isLink: true },
      { id: 4, name: 'clientLocalIp', displayText: this.translateService.translate('TableColumn.ClientLocalIp'), isLink: true },
      { id: 5, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true },
      { id: 6, name: 'clientMacAddress', displayText: this.translateService.translate('TableColumn.ClientMacAddress'), isLink: true },
      { id: 7, name: 'clientBoxSerial', displayText: this.translateService.translate('TableColumn.ClientBoxSerial'), isLink: true },
      // { id: 8, name: 'userId', displayText: this.translateService.translate('TableColumn.UserId'), isLink: true },
      { id: 8, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
      { id: 9, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
      { id: 10, name: 'destinationIp', displayText: this.translateService.translate('TableColumn.DestinationIp'), isLink: true },
      { id: 11, name: 'destinationIpCountryCode', displayText: this.translateService.translate('TableColumn.DestinationCountry'), isLink: true },
      { id: 12, name: 'category', displayText: this.translateService.translate('TableColumn.Category'), isLink: true },
      { id: 13, name: 'applicationName', displayText: this.translateService.translate('TableColumn.ApplicationName'), isLink: true },
      { id: 14, name: 'action', displayText: this.translateService.translate('TableColumn.Action'), isLink: true },
      { id: 15, name: 'reasonType', displayText: this.translateService.translate('TableColumn.ReasonType'), isLink: true },
      { id: 16, name: 'ruleNumber', displayText: this.translateService.translate('TableColumn.RuleNumber'), isLink: true },
      { id: 17, name: 'ruleBy', displayText: this.translateService.translate('TableColumn.RuleBy'), isLink: true, format: d => d?.substring(2) },
      { id: 18, name: 'ruleKeyword', displayText: this.translateService.translate('TableColumn.RuleKeyword'), isLink: true },
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
    this.monitorService.getData(searchSettings, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: Response) => {
        if (res['result'] || res['total']) {
          this.tableData = res['result'];
          this.totalCount = res['total'];
        }

        this.tableConfig.rows = [];
        // add column headers
        this.tableConfig.headers = [
          { name: 'time', displayText: 'Time', columnName: ['time'] },
          {
            name: 'source', columnName:
              ['sourceIp', 'sourceIpCountryCode', 'agentAlias', 'clientLocalIp', 'hostName', 'clientMacAddress', 'clientBoxSerial'], displayText: 'Source'
          },
          {
            name: 'destination', columnName:
              ['domain', 'subdomain', 'destinationIp', 'destinationIpCountryCode'], displayText: 'Destination'
          },
          {
            name: 'decision', columnName:
              ['category', 'applicationName', 'action', 'reasonType', 'ruleNumber', 'ruleBy', 'ruleKeyword'], displayText: 'Decision'
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

          if ((rowItem['domain'] && rowItem['domain'] !== punycode.toUnicode(rowItem['domain'])) ||
            (rowItem['subdomain'] && rowItem['subdomain'] !== punycode.toUnicode(rowItem['subdomain']))) {
            rowItem.popoverRows = [{ domain: punycode.toUnicode(rowItem['domain']), subdomain: punycode.toUnicode(rowItem['subdomain']) }];
          } else {
            rowItem.popoverClass = 'none';
          }

          this.tableConfig.rows.push(rowItem);
        });
        this.calculateAfterData();
      });
  }

  getNavigateByClickedDomain(domain) {
    /* const currentSession = this.authService.currentSession;
    this.token = currentSession.token;
    this.refreshToken = currentSession.refreshToken;
    console.log(`${this.configService.host.cyberXRayUrl + domain}?t=${this.token}&r=${this.refreshToken}`)
    window.open(`${this.configService.host.cyberXRayUrl + domain}?t=${this.token}&r=${this.refreshToken}`, "_blank"); 
    */
    this.cyberxrayService.open(domain);
  }

  columnSet() {
    for (let column of this.configColumn) {
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

  linkClicked($event: LinkClick) {
    this.linkClickedOutput.emit($event);
  }
}
