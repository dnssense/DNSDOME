import { ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/customReportService';
import ApexCharts from 'node_modules/apexcharts/dist/apexcharts.common.js';
import { ExcelService } from 'src/app/core/services/excelService';
import { PdfService } from 'src/app/core/services/pdfService';
import { RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { ExportTypes } from 'roksit-lib/lib/modules/rk-table/rk-table-export/rk-table-export.component';
import { LinkClick } from '../../monitor/result/monitor-result.component';
import * as moment from 'moment';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { LOCAL_STORAGE_THEME_COLOR } from 'src/app/modules/theme/theme.component';
import { ConfigService } from 'src/app/core/services/config.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import * as punycode from 'punycode';

export interface TableBadgeOutput {
  name: string;
  value: boolean;
}

@Component({
  selector: 'app-customreport-result',
  templateUrl: 'customreport-result.component.html',
  styleUrls: ['customreport-result.component.css']
})
export class CustomReportResultComponent implements OnDestroy, AfterViewInit {

  constructor(
    private customReportService: CustomReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private translateService: TranslatorService,
    private configService: ConfigService,
    private authService: AuthenticationService
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

  token;
  refreshToken;
  navigationUrl = environment.navigationUrl;

  elementRef: ElementRef;
  public date = new Date();
  public loading = false;
  public selectedColumns: AggregationItem[];
  private logChart: any;

  theme: string;

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

  @Output() changeColumnBadge = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;
  logCountHistogram: any;

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  maxHeight = window.innerWidth > 768 ? (window.innerHeight - 218) - (document.body.scrollHeight - document.body.clientHeight) : null;

  tableConfig: RkTableConfigModel = {
    columns: [
      /* { id: 0, name: 'time', displayText: 'Time', isLink: true }, */
      { id: 1, name: 'domain', displayText: this.translateService.translate('TableColumn.Domain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
      { id: 2, name: 'subdomain', displayText: this.translateService.translate('TableColumn.Subdomain'), isLink: true, moreText: '?', isPopover: true, noLinkInPopover: true, popoverTrigers: 'mouseenter' },
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
      { id: 16, name: 'hostName', displayText: this.translateService.translate('TableColumn.HostName'), isLink: true }
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

      this.tableConfig.rows = [];
      this.tableConfig.arrowVisible = true;

      this.data.forEach(item => {
        const rowItem: RkTableRowModel = { selected: false };

        this.selectedColumns.forEach((selectedCol, index) => {
          rowItem[selectedCol.column.name] = item[index];

        });

        if ((rowItem['domain'] && rowItem['domain'] !== punycode.toUnicode(rowItem['domain'])) ||
            (rowItem['subdomain'] && rowItem['subdomain'] !== punycode.toUnicode(rowItem['subdomain']))) {
          rowItem.popoverRows = [{domain: punycode.toUnicode(rowItem['domain']), subdomain: punycode.toUnicode(rowItem['subdomain'])}];
        } else {
          rowItem.popoverClass = 'none';
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
            text: 'No Data',
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

  checkboxAllChange($event: boolean) {
    this.data.forEach(elem => {
      elem.selected = $event;
    });
  }

  exportAs(extention: ExportTypes) {
    let data = this.data.filter(x => x.selected);

    if (data.length === 0) {
      data = this.data;
    }

    if (data && data.length > 0) {

      let jsonString = '[';
      for (let i = 0; i < data.length - 1; i++) {
        const da = data[i];
        jsonString += '{';
        jsonString += '"id":' + (i + 1) + ',';
        for (let j = 0; j < da.length - 1; j++) {
          const e = da[j];
          jsonString += '"' + this.selectedColumns[j].label + '" : "' + e + '",';
        }
        jsonString += '"Count": "' + da[da.length - 1] + '" },';
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

  // linkClicked($event: LinkClick) {
  //   this.linkClickedOutput.emit($event);
  // }

  columnChanged($event: TableBadgeOutput) {
    // const columnIndex = this.selectedColumns.findIndex(x => x.column.name === $event.name);

    const selectedColumns = <AggregationItem[]>JSON.parse(JSON.stringify(this.searchSetting.columns.columns));
    const columnIndex = selectedColumns.findIndex(x => x.column.name === $event.name);

    if ($event.value && columnIndex == -1) {
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

  isLink(column: string): boolean {
    return this.tableConfig.columns.find(x => x.name === column).isLink;
  }

  linkClicked(columnName: string, value) {
    this.linkClickedOutput.emit({
      columnModel: {
        name: columnName,
        isLink: true,
      },
      value: columnName === 'action' ? (value ? 'Allow' : 'Deny') : value
    } as LinkClick);
  }

  sort(col, columnIndex: number) {
    this.data = this.data.sort((a, b) => {
      return this.sortDirection === 'asc' ? (a[columnIndex] > b[columnIndex] ? 1 : -1) : (a[columnIndex] < b[columnIndex] ? 1 : -1);
    });

    if (col) {
      this.sortedColumn = col.name;
    }

    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
}
