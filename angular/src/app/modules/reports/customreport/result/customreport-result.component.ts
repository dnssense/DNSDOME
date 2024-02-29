
import {takeUntil} from 'rxjs/operators';
import { ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output, AfterViewInit, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/customReportService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js';
import { ExcelService } from 'src/app/core/services/excelService';
import { PdfService } from 'src/app/core/services/pdfService';
import * as moment from 'moment';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import * as punycode from 'punycode';
import { CyberXRayService } from '../../../../core/services/cyberxray.service';
import {RkApexChartEN, RkApexChartTR, RkApexChartRU, ActionClick, RkTableColumnModel, RkTableComponent, RkTableConfigModel, RkTableRowModel, ExportTypes, RkSelectModel} from 'roksit-lib';

export interface TableBadgeOutput {
  name: string;
  value: boolean;
}

@Component({
  selector: 'app-customreport-result',
  templateUrl: 'customreport-result.component.html',
  styleUrls: ['customreport-result.component.css']
})
export class CustomReportResultComponent implements OnDestroy, AfterViewInit, OnInit {

  constructor(
    private customReportService: CustomReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private translateService: TranslatorService,
    private _translateService: TranslateService,
    private configService: ConfigService,
    private authService: AuthenticationService,
    private cyberxrayService: CyberXRayService
  ) {
    // const theme = localStorage.getItem(LOCAL_STORAGE_THEME_COLOR);
    const currentUser = this.authService.currentSession?.currentUser;
    const theme = this.configService.getThemeColor(currentUser?.id);

    const currentSession = this.authService.currentSession;
    this.token = currentSession.token;
    this.refreshToken = currentSession.refreshToken;

    if (theme) {
      this.theme = theme;
    }
  }
  ngOnInit(): void {
    /*
    this._translateService.onLangChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.changeColumnNames();
    });*/
  }

  token;
  refreshToken;


  elementRef: ElementRef;
  public date = new Date();
  public loading = false;
  public selectedColumns: AggregationItem[];
  selectedRkColumns: RkTableColumnModel[];
  private logChart: any;

  theme: string;

  @Input() set searchSetting(value: SearchSetting) {
    this.ss = value;
  }
  get searchSetting(): SearchSetting {
    return this.ss;
  }


  @Output() actionClickedOutput = new EventEmitter<ActionClick>();

  public ss: SearchSetting;

  @Input() public data: any[];
  @Input() public total = 0;
  @Input() public multiplier = 1;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public searchEmitter = new EventEmitter();

  @Output() changeColumnBadge = new EventEmitter();

  @ViewChild('rkTable') tableComponent: RkTableComponent;
  logCountHistogram: any;

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  maxHeight = window.innerWidth > 768 ? (window.innerHeight - 218) - (document.body.scrollHeight - document.body.clientHeight) : null;

  tableConfig: RkTableConfigModel = {
    copyText: {text: this.translateService.translate('Copy'), doneText: this.translateService.translate('Copied')},
    defaultActionText: {text: this.translateService.translate('AddToFilter'), doneText: this.translateService.translate('AddedToFilter')},
    filterColumnText: this.translateService.translate('ColumnsToDisplay'),
    cellDataMaxLen: 30,
    columns: [
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), showAction: true, isPopover: true },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), showAction: true, isPopover: true },
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
      { id: 15, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), showAction: true }
    ],
    rows: [],
    selectableRows: true,
    arrowVisible: true,
    isSelectedAll: false
  };

  paginationOptions: RkSelectModel[] = [
    { displayText: '10', value: 10, selected: true },
    { displayText: '25', value: 25 },
    { displayText: '50', value: 50 },
    { displayText: '100', value: 100 },
    { displayText: '250', value: 250 },
    { displayText: '500', value: 500 },
  ];

  firstDate: any;

  sortDirection;

  sortedColumn: string;

  ngAfterViewInit() {
    this.maxHeight = window.innerWidth > 768 ? (window.innerHeight - 218) - (document.body.scrollHeight - document.body.clientHeight) : null;
  }

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
    this.customReportService.getData(searchSetting).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: Response) => {
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
      this.selectedRkColumns = [];
      this.tableConfig.columns.forEach(col => {
        let selectedCol;
        this.selectedColumns.forEach((item, index) => {
          if (item.column.name === col.name) {
            item.label = col.displayText;
            selectedCol = item;
            this.selectedRkColumns[index] = col;
            return;
          }
        });
        col.selected = !!selectedCol;
      });

      this.tableConfig.rows = [];
      this.tableConfig.arrowVisible = true;

      this.data.forEach(item => {

        const rowItem: RkTableRowModel = {selected: item.selected};


        this.selectedColumns.forEach((col, index) => {
            if (rowItem['domain'] === 'Others') {
              rowItem[col.column.name] = '';
              return;
            }
            rowItem[col.column.name] = item[index];
            if (col.column.name === 'action') {
              rowItem[col.column.name] = rowItem[col.column.name] === 'true' ? 'Allow' : 'Deny';
             }
       });

       rowItem[this.selectedColumns.length] = item[this.selectedColumns.length];

       if (rowItem['domain'] != null && rowItem['domain'] !== 'Others') {
          rowItem.imgOptions = {
            src: '../../../../../assets/img/CyberxIcon.svg',
            columnName: 'domain',
            isNavigate: true,
            customClass: 'navigate-icon'
          };
       }
       if ((rowItem['domain'] && rowItem['domain'] !== punycode.toUnicode(rowItem['domain']))) {
          rowItem.popoverRows = [{ domain: punycode.toUnicode(rowItem['domain'])}];
       } else if (rowItem['subdomain'] && rowItem['subdomain'] !== punycode.toUnicode(rowItem['subdomain'])) {
          rowItem.popoverRows = [{subdomain: punycode.toUnicode(rowItem['subdomain']) }];
       }
      this.tableConfig.rows.push(rowItem);

      });
      // action column exits
      /*  if (this.selectedColumns.find(x => x.column.name == 'action') && this.tableConfig.rows.length > 1) {
           this.selectedColumns.forEach((x, index) => {
             if (x.column.name == 'action') {
               this.tableConfig.rows[this.tableConfig.rows.length - 1][index] = null;
             }
           });
       } */

      this.maxHeight = window.innerWidth > 768 ? (window.innerHeight - 218) - (document.body.scrollHeight - document.body.clientHeight) : null;
      this.tableComponent?.checkTable();
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
    this.customReportService.loadHistogram(settings).subscribe((res: any[]) => {

      const data: any[] = res;



      if (data) {
        if (this.logCountHistogram) {
          this.logCountHistogram.resetSeries();
        }


        const series = [
          {
            name: 'Hit', type: 'area', data: data.filter ? data.filter(x => x.length >= 2).map(x => {
              const d = new Date(x[0]);

              // return [new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()).getTime(), x[1]];

              return [moment(d).utc(true).toDate().getTime(), x[1]];

            }) : []
          }

        ];



        const options = {
          id: 'reportchart',
          series: series,
          chart: {
            locales: [RkApexChartEN, RkApexChartTR, RkApexChartRU],
            defaultLocale: this.translateService.getCurrentLang(),
            height: 300, type: 'area', foreColor: '#898ea4',
            selection: {
              enabled: false,
            },
            zoom: { enabled: false },
            toolbar: {
              show: false,
              tools: {
                download: false,
                pan: false
              }
            },
            events: {
              zoomed: (chartContext, { xaxis, yaxis }) => {

                const offset = moment().utcOffset() * 60 * 1000;

                const startDate = moment(xaxis.min - offset).utc(false).toISOString();
                const endDate = moment.utc(xaxis.max - offset).toISOString();


                this.searchSetting.dateInterval = null;

                this.searchSetting.startDate = startDate;
                this.searchSetting.endDate = endDate;

                this.searchEmitter.emit(this.searchSetting);
              }
            }
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
          xaxis: {
            type: 'datetime',
            tickAmount: 1,
            style: { color: '#e9ebf1' },
            tooltip: {
              enabled: false
            }
          },
          tooltip: {
            x: { format: 'dd/MM/yy HH:mm:ss' },
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
              // const date = new Date(w.globals.seriesX[0][dataPointIndex]);

              const mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');

              return `
                <div class="__apexcharts_custom_tooltip" id="top-domain-tooltip">
                  <div class="__apexcharts_custom_tooltip_date" >${mDate}</div>

                  <div class="__apexcharts_custom_tooltip_content">
                    <span class="__apexcharts_custom_tooltip_row">
                      <span class="color" style="background: #2cd9c5"></span> Hit: <b>${series[0][dataPointIndex]}</b>
                    </span>
                  </div>
                </div>
              `;
            }
          },
          grid: {
            borderColor: this.theme === 'white' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)',
            xaxis: {
              lines: {
                show: true
              }
            },
            yaxis: {
              lines: {
                show: true
              }
            },
          },
          legend: { show: false },
          annotations: { yaxis: [{ label: { fontSize: '20px' } }] },
          animations: { enabled: true },
          noData: {
            text: this.translateService.translate('NoData'),
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
              color: undefined,
              fontSize: '14px',
              fontFamily: undefined
            }
          }
        };

        if (!this.logCountHistogram) {
          this.logCountHistogram = new ApexCharts(document.querySelector('#customReportChart'), options);

          this.logCountHistogram.render();

        } else {

          this.logCountHistogram.updateSeries(series);
        }




      }

    });
  }

  private changeColumnNames() {
    this.tableConfig.copyText = {text: this.translateService.translate('Copy'), doneText: this.translateService.translate('Copied')};
    this.tableConfig.defaultActionText = {text: this.translateService.translate('AddToFilter'), doneText: this.translateService.translate('AddedToFilter')};
    this.tableConfig.filterColumnText = this.translateService.translate('ColumnsToDisplay');

    this.tableConfig.columns = [
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), showAction: true },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), showAction: true },
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
      { id: 15, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), showAction: true }
    ];
  }

  checkboxAllChange($event: boolean) {
    this.tableConfig?.rows?.forEach(elem => {
      elem.selected = $event;
    });
  }

  exportAs(extention: ExportTypes) {
    let data = this.tableConfig.rows.filter(x => x.selected);

    if (data.length === 0) {
      data = this.tableConfig.rows;
    }

    if (data && data.length > 0) {

      let jsonString = '[';
      for (let i = 0; i < data.length; i++) {
        const da = data[i];
        jsonString += '{';
        jsonString += '"id":' + (i + 1) + ',';
        for (let j = 0; j < this.selectedColumns.length; j++) {
          const e = da[this.selectedColumns[j].column.name];
          jsonString += '"' + this.selectedColumns[j].label + '" : "' + e + '",';
        }
        jsonString += '"Count": "' + da[this.selectedColumns.length] + '" },';
      }

      if (jsonString.length > 1) {
        jsonString = jsonString.substr(0, jsonString.length - 1);
      }

      jsonString += ']';

      const d = new Date();
      if (extention === 'excel') {
        this.excelService.exportAsExcelFile(JSON.parse(jsonString), 'CustomReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      } else if (extention === 'pdf') {
        this.pdfService.exportAsPdfFile('landscape', JSON.parse(jsonString), 'CustomReport-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
      }
    }
  }


  columnChanged($event: TableBadgeOutput) {
    // const columnIndex = this.selectedColumns.findIndex(x => x.column.name === $event.name);

    const selectedColumns = <AggregationItem[]>JSON.parse(JSON.stringify(this.searchSetting.columns.columns));
    const columnIndex = selectedColumns.findIndex(x => x.column.name === $event.name);
    if ($event.value && columnIndex === -1) {
      selectedColumns.push({
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
        selectedColumns.splice(columnIndex, 1);
      }
    }

    this.searchSetting.columns.columns = selectedColumns;

    this.changeColumnBadge.emit(true);
  }

  private capitalize(value: string): string {
    return value[0].toLocaleUpperCase() + value.substring(1);
  }


  actionClicked($event: ActionClick) {
    this.actionClickedOutput.emit({
      columnModel: {
        name: $event.columnModel.name,
      },
      value: $event.columnModel.name === 'action' ? ($event.value ? 'Allow' : 'Deny') : $event.value
    } as ActionClick);
  }

  sort(col, columnIndex: number) {
    this.tableConfig.rows = this.tableConfig?.rows?.sort((a, b) => {
      return this.sortDirection === 'asc' ? (a[columnIndex] > b[columnIndex] ? 1 : -1) : (a[columnIndex] < b[columnIndex] ? 1 : -1);
    });

    if (col) {
      this.sortedColumn = col.name;
    }

    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  getNavigateByClickedDomain(domain) {
    this.cyberxrayService.open(domain);
  }
}
