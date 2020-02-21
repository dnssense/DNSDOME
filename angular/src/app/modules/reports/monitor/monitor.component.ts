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

  constructor() { }

  public searchSetting: SearchSetting = new SearchSetting();

  @ViewChild(RoksitSearchComponent)
  private roksitSearchComponent: RoksitSearchComponent;

  @ViewChild(MonitorResultComponent)
  private monitorResultComponent: MonitorResultComponent;

  ngOnInit() { }

  ngAfterViewInit() {
    this.monitorResultComponent.tableColumnsChanged.subscribe(res => {
      this.monitorResultComponent.columns.forEach(col => {
        this.roksitSearchComponent.columnFilterOptions.push({ displayText: col.beautyName, value: col.name });
      });
    });
  }

  public search(_searchSettings: SearchSetting) {
    this.searchSetting = _searchSettings;
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh(_searchSettings);
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
      return;
    }

    this.searchSetting.must.push(new ColumnTagInput(column, '=', value));

    this.roksitSearchComponent.setSearchSetting(this.searchSetting);
  }
}
