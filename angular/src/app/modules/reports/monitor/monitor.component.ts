import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent } from './result/monitor-result.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';

@Component({
  selector: 'app-monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: ['monitor.component.sass'],
  providers: [DateFormatPipe]
})
export class MonitorComponent implements OnInit, AfterViewInit {
  public searchSetting: SearchSetting = new SearchSetting();

  @ViewChild(RoksitSearchComponent, { static: false })
  private roksitSearchComponent: RoksitSearchComponent;
  @ViewChild(MonitorResultComponent, { static: false })
  private monitorResultComponent: MonitorResultComponent;

  constructor(public dateFormatPipe: DateFormatPipe) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.monitorResultComponent.tableColumnsChanged.subscribe(res => {
      this.monitorResultComponent.columns.forEach(col => {
        this.roksitSearchComponent.columnFilterOptions.push({ displayText: col.beautyName, value: col.name })
      });
    });
  }

  public search(ss: SearchSetting) {
    this.searchSetting = ss;
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh(ss);
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
      //     this.notificationService.warning(column + "=" + value + " exists in your criteria");
      return;
    }
    this.searchSetting.must.push(new ColumnTagInput(column, '=', value));
    //this.notificationService.info(column + "=" + (column == 'time' ? this.dateFormatPipe.transform(value, []) : value) + " added into your criteria");
    this.roksitSearchComponent.setSearchSetting(this.searchSetting);
  }

  // public updateSearchSetting(setting: SearchSetting) {
  //   this.searchSetting = setting;
  // }
}
