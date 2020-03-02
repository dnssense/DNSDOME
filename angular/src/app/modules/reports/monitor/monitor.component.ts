import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent, LinkClick } from './result/monitor-result.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';

@Component({
  selector: 'app-monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: ['monitor.component.sass'],
  providers: [DateFormatPipe]
})
export class MonitorComponent implements OnInit {

  constructor() { }

  public searchSettings: SearchSetting = new SearchSetting();

  @ViewChild(RoksitSearchComponent)
  private roksitSearchComponent: RoksitSearchComponent;

  @ViewChild(MonitorResultComponent)
  private monitorResultComponent: MonitorResultComponent;

  ngOnInit() { }

  public search(_searchSettings: SearchSetting) {
    this.searchSettings = _searchSettings;
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh(_searchSettings);
  }

  public addValuesIntoSelected($event) {
    const column: string = $event.column;
    const value = $event.data;
    let exists = false;

    for (const a of this.searchSettings.must) {
      if (a.field === column && a.value === value) {
        exists = true;
        break;
      }
    }

    if (exists) {
      return;
    }

    this.searchSettings.must.push(new ColumnTagInput(column, '=', value));

    this.roksitSearchComponent.setSearchSetting(this.searchSettings);
  }

  linkClicked($event: LinkClick) {
    const existsFilter = this.searchSettings.must.concat(this.searchSettings.mustnot).some(x => x.field === $event.columnModel.name);

    if (!existsFilter) {
      this.searchSettings.must.push(new ColumnTagInput($event.columnModel.name, '=', $event.value));
    }
  }
}
