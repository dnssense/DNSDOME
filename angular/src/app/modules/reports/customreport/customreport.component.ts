import { OnInit, ElementRef, Component, ViewChild } from '@angular/core';
import { CustomReportResultComponent } from './result/customreport-result.component';
import { LogColumn } from 'src/app/core/models/LogColumn';
import { AggregationItem } from 'src/app/core/models/AggregationItem';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { FastReportService } from 'src/app/core/services/FastReportService';
import { LinkClick } from '../monitor/result/monitor-result.component';
import { FilterBadgeModel, RoksitSearchComponent } from '../../shared/roksit-search/roksit-search.component';

@Component({
  selector: 'app-customreport',
  templateUrl: 'customreport.component.html',
  styleUrls: ['customreport.component.sass']
})
export class CustomReportComponent implements OnInit {

  constructor(
    private fastReportService: FastReportService) { }

  public total = 0;
  public multiplier = 1;
  public searchSetting: SearchSetting = new SearchSetting();
  public selectedColumns: AggregationItem[];
  public columns: LogColumn[];
  public columnsTemp: LogColumn[];
  public data: any[];

  @ViewChild('tableDivComponent') tableDivComponent: ElementRef;

  @ViewChild(CustomReportResultComponent) customReportResultComponent: CustomReportResultComponent;

  @ViewChild(RoksitSearchComponent) customReportSearchComponent: RoksitSearchComponent;

  filters: FilterBadgeModel[] = [];

  ngOnInit(): void {
    this.fastReportService.tableColumns.subscribe((res: LogColumn[]) => {
      this.columns = res;
    });

    this.search(this.searchSetting);
  }

  public search(setting: SearchSetting) {
    this.searchSetting = setting;

    if (this.searchSetting.columns.columns.length === 0) {
      this.searchSetting.columns.columns = [
        {
          column: {
            name: 'domain',
            beautyName: 'Domain',
            hrType: '',
            aggsType: 'TERM',
            checked: true
          }, label: 'Domain'
        }
      ] as AggregationItem[];
    }

    if (this.customReportResultComponent) {
      this.customReportResultComponent.search(this.searchSetting);
    }
  }

  public addValuesIntoSelected() {
    this.customReportSearchComponent.setSearchSetting(this.searchSetting);
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
  }
}
