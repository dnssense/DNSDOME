import { OnInit, ElementRef, OnDestroy, Component, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Subject } from 'rxjs';
import { CustomReportSearchComponent } from './search/customreport-search.component';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit {

  constructor(
    private fastReportService: FastReportService,
    private notificationService: NotificationService
  ) { }

  public total = 0;
  public multiplier = 1;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columns: LogColumn[];
  public columnsTemp: LogColumn[];
  public data: any[];

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  @ViewChild(CustomReportResultComponent) customReportResultComponent: CustomReportResultComponent;

  @ViewChild(CustomReportSearchComponent) customReportSearchComponent: CustomReportSearchComponent;

  ngOnInit(): void {
    this.fastReportService.tableColumns.subscribe((res: LogColumn[]) => {
      this.columns = res;
    });
  }

  public search(setting: SearchSetting) {
    this.searchSetting = setting;

    (this.searchSetting.columns.columns as any) = [JSON.parse('{"column":{"name":"domain","beautyName":"Domain","hrType":"","aggsType":"TERM","checked":true},"label":"Domain"}')];

    this.customReportResultComponent.search(this.searchSetting);
  }

  public addValuesIntoSelected($event) {

    const column: string = $event.column;
    const value = $event.data;

    let exists = false;
    for (const a of this.searchSetting.must) {
      if (a.field === column && a.value === value) {
        exists = true;
        break;
      }
    }

    if (exists) {
      this.notificationService.error(column + '=' + value + ' exists in your criteria');
      return;
    }

    const columnInput = new ColumnTagInput(column, '=', value);

    this.searchSetting.must.push(columnInput);

    this.notificationService.info(columnInput.toString() + ' Added into your criteria');

    this.customReportSearchComponent.setSearchSetting(this.searchSetting);
  }

}
