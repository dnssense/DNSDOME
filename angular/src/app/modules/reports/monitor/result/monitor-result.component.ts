import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
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
export class MonitorResultComponent implements OnInit {
  public totalItems: number = 0;
  public currentPage: number = 1;
  public columns: LogColumn[];
  public selectedColumns: LogColumn[];
  public tableData: any;
  public responseData: any;
  public total: number = 0;
  public multiplier = 1;
  public maxSize: number = 10;
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  @Input() public searchSetting: SearchSetting;
  @Output() public addColumnValueEmitter = new EventEmitter();

  constructor(private monitorService: MonitorService) { }

  ngOnInit() { }

  refresh() {
    this.loadGraph();
  }

  public stopRefreshing() {
    // this.spinnerService.stop();
  }

  public loadGraph() {
    // this.spinnerService.start();
    this.monitorService
      .getGraphData(this.searchSetting, this.currentPage)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (res: Response) => {
          this.tableData = res['result'];
          this.totalItems = res['total'];
        },
        () => this.stopRefreshing(),
        () => this.stopRefreshing()
      );
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

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    this.loadGraph();
  };

  public addColumnValueIntoSelectedValues(column: any, xx: any) {
    this.addColumnValueEmitter.emit({ column: column, data: xx }); // How to pass the params event and ui...?
  }

  public changeColumns($event) {
    //you may implement here...
  }
}
