import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent } from './result/monitor-result.component';
import { MonitorSearchComponent } from './search/monitor-search.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';

@Component({
  selector: 'app-monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: ['monitor.component.sass'],
  providers: [DateFormatPipe]
})
export class MonitorComponent implements OnInit {
  public searchSetting: SearchSetting = new SearchSetting();

  @ViewChild(MonitorSearchComponent)
  private monitorSearchComponent: MonitorSearchComponent;
  @ViewChild(MonitorResultComponent)
  private monitorResultComponent: MonitorResultComponent;

  constructor(public dateFormatPipe: DateFormatPipe) { }

  ngOnInit() { }

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
    this.monitorSearchComponent.setSearchSetting(this.searchSetting);
  }

  // public updateSearchSetting(setting: SearchSetting) {
  //   this.searchSetting = setting;
  // }
}
