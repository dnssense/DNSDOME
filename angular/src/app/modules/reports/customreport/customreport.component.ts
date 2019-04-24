import { OnInit, ElementRef, OnDestroy, Component, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HistogramComponent } from '../shared/histogram/histogram.component';
import { Subscription, Subject } from 'rxjs';
import { CustomReportSearchComponent } from './search/customreport-search.component';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { CustomReportService } from 'src/app/core/services/CustomReportService';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit, OnDestroy {

  public total: number = 0;
  public multiplier: number = 1;
  public histogramIsActive: boolean = false;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columns: LogColumn[];
  public data: any[];

  @ViewChild("tableDivComponent")
  tableDivComponent: ElementRef;
  @ViewChild(HistogramComponent)
  public histogramComponent: HistogramComponent;
  @ViewChild(CustomReportResultComponent)
  public customReportResultComponent: CustomReportResultComponent;
  @ViewChild(CustomReportSearchComponent)
  public customReportSearchComponent: CustomReportSearchComponent;

  private ngUnsubscribe: Subject<any> = new Subject<any>();
  private tableColumnsubscription: Subscription;
  private categoriesSubscription: Subscription;
  private applicationSubscription: Subscription;

  constructor(private customReportService: CustomReportService, private fastReportService: FastReportService, private notificationService: NotificationService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit(): void {
    this.tableColumnsubscription = this.fastReportService.tableColumns.takeUntil(this.ngUnsubscribe).subscribe((res: LogColumn[]) => {
      this.columns = res;
    });
  }

  public updateSearchSetting(setting: any) {
    this.searchSetting = setting;
  }

  public search() {
    if (!this.searchSetting.columns.columns || this.searchSetting.columns.columns.length == 0) {
      //todo alert here. Focus on the table columns ...
      this.notificationService.warning("You must select at least one column for a report.");
      return;
    }
    if (this.histogramIsActive) {
      this.histogramComponent.refresh();
    } else {
      this.histogramIsActive = true;
    }
    this.customReportResultComponent.search(this.searchSetting);
  }

  public addValuesIntoSelected($event) {

    let column: string = $event.column;
    let value = $event.data;

    let exists = false;
    for (let a of this.searchSetting.must) {
      if (a.field == column && a.value == value) {
        exists = true;
        break;
      }
    }

    if (exists) {
      this.notificationService.error(column + "=" + value + " exists in your criteria");
      return;
    }

    let columnInput = new ColumnTagInput(column, "=", value);

    this.searchSetting.must.push(columnInput);

    this.notificationService.info(columnInput.toString() + " Added into your criteria");

    this.customReportSearchComponent.setSearchSetting(this.searchSetting);

  }

}
