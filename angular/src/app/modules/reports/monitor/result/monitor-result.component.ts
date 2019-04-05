import { OnInit, Component, Input } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/MonitorService';
import { Subject } from 'rxjs';
import { LogColumn } from 'src/app/core/models/LogColumn';

@Component({
  selector: 'app-monitor-result',
  templateUrl: 'monitor-result.component.html',
  styleUrls: ['monitor-result.component.sass']
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

  constructor(private monitorService: MonitorService) {}

  ngOnInit() {}

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
}
