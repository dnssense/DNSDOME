import { OnInit, ElementRef, OnDestroy, Component, Input, ViewChild, EventEmitter, Output } from '@angular/core';

import { NotificationService } from 'src/app/core/services/notification.service';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { Subject } from 'rxjs';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';

@Component({
  selector: 'app-customreport-result',
  templateUrl: 'customreport-result.component.html',
  styleUrls: ['customreport-result.component.sass']
})
export class CustomReportResultComponent implements OnInit, OnDestroy {
  elementRef: ElementRef;
  public date = new Date();
  public loading: boolean = false;
  public selectedColumns: AggregationItem[];

  @Input() public searchSetting: SearchSetting;
  @Input() public data: any[];
  @Input() public total: number = 0;
  @Input() public multiplier: number = 1;
  @Output() public addColumnValueEmitter = new EventEmitter();
  @Output() public searchEmitter = new EventEmitter();

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  private ngUnsubscribe: Subject<any> = new Subject<any>();

  constructor(
    private customReportService: CustomReportService,
    private notificationService: NotificationService) { }

  ngOnInit(): void { }

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
    //this.spinnerService.start();
    this.customReportService.getData(searchSetting).takeUntil(this.ngUnsubscribe).subscribe((res: Response) => {

      if (res['searchSetting'] != null) {
        this.searchSetting = res['searchSetting'];
      }

      let total = 0;
      let data: any = res;
      this.selectedColumns = <AggregationItem[]>JSON.parse(JSON.stringify(searchSetting.columns.columns));


      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][this.selectedColumns.length]);
          total += val;
        }

        var maxPercentage = 0;
        for (let i = 0; i < data.length; i++) {
          let val = parseInt(data[i][this.selectedColumns.length]);
          let tempPercentage = val * 1.0 / total;
          if (tempPercentage > maxPercentage) {
            maxPercentage = tempPercentage;
          }
        }
        let multiplier = Math.floor(100 / (maxPercentage * 100));

        this.multiplier = multiplier;
        this.total = total;

      }
      this.data = data;
      console.log(this.data);

    }, () => this.stopRefreshing(),
      () => this.stopRefreshing()
    );

  }
  public stopRefreshing() {
    //this.spinnerService.stop();
  }
}
