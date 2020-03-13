import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorResultComponent, LinkClick } from './result/monitor-result.component';
import { DateFormatPipe } from '../../shared/pipes/DateFormatPipe';
import { RoksitSearchComponent, FilterBadgeModel } from '../../shared/roksit-search/roksit-search.component';

@Component({
  selector: 'app-monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: ['monitor.component.sass'],
  providers: [DateFormatPipe]
})
export class MonitorComponent implements OnInit {

  constructor() { }

  public searchSettings: SearchSetting = new SearchSetting();

  filters: FilterBadgeModel[] = [];

  @ViewChild(RoksitSearchComponent)
  private roksitSearchComponent: RoksitSearchComponent;

  @ViewChild(MonitorResultComponent)
  private monitorResultComponent: MonitorResultComponent;

  isShowRunBarz = false;

  ngOnInit() { }

  public search(_searchSettings: SearchSetting) {
    this.searchSettings = _searchSettings;
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh(_searchSettings);
  }

  public addValuesIntoSelected($event) {
    this.roksitSearchComponent.setSearchSetting(this.searchSettings);
  }

  linkClicked($event: LinkClick) {
    const filter = this.filters.find(x => x.name === $event.columnModel.name);

    if (filter) {
      const exists = filter.values.some(x => x === $event.value);

      if (!exists) {
        const _filterValues = JSON.parse(JSON.stringify(filter.values)) as string[];

        _filterValues.unshift($event.value);

        filter.values = _filterValues;
      }
    } else {
      this.filters.push(new FilterBadgeModel($event.columnModel.name, true, [$event.value]));
    }

    this.isShowRunBarz = true;
  }

  clearFilters() {
    this.filters = [];
  }
}
