import { OnInit, Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/MonitorService';
import { Subject } from 'rxjs';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { CountryPipe } from 'src/app/modules/shared/pipes/CountryPipe';

@Component({
  selector: 'app-monitor-result',
  templateUrl: 'monitor-result.component.html',
  styleUrls: ['monitor-result.component.css'],
  providers: [CountryPipe]
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
  columnListLength: number = 10;

  @Input() public searchSetting: SearchSetting;
  @Output() public addColumnValueEmitter = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;
  @ViewChild('columnTablePanel') columnTablePanel: any;

  constructor(private monitorService: MonitorService) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    this.monitorService.initTableColumns().takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;
      var tempcolumns = [];
      for (let data of this.columns) {
        if (data["checked"]) {
          tempcolumns.push(data);
        }
      }
      this.selectedColumns = tempcolumns;
    });
    this.loadGraph(this.searchSetting);
  }

  refresh(ss:SearchSetting) {
    this.loadGraph(ss);
  }

  public stopRefreshing() {
    // this.spinnerService.stop();
  }

  public loadGraph(ss:SearchSetting) {
    // this.spinnerService.start();
    this.monitorService.getGraphData(ss, this.currentPage).takeUntil(this.ngUnsubscribe)
      .subscribe((res: Response) => { this.tableData = res['result']; this.totalItems = res['total']; },
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
    if (this.columnListLength == 10) {
      this.columnListLength = this.columns.length;
    } else {
      this.columnListLength = 10;
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
}
