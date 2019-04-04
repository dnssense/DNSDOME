import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnTagInput } from 'src/app/core/models/ColumnTagInput';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { MonitorService } from 'src/app/core/services/MonitorService';
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

  constructor(
    private monitorService: MonitorService,
    public dateFormatPipe: DateFormatPipe
  ) {}

  ngOnInit() {}

  public search(searchSetting: SearchSetting) {
    this.monitorResultComponent.currentPage = 1;
    this.monitorResultComponent.refresh();
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
    // if (exists) {
    //   this.notificationService.notify(OperationResult.getResult("error", "Selection Exists", column + "=" + value + " exists in your criteria"));
    //   return;
    // }

    this.searchSetting.must.push(new ColumnTagInput(column, '=', value));

    //this.notificationService.notify(OperationResult.getResult("info", "Selection Added", column + "=" + (column == 'time' ? this.dateFormatPipe.transform(value, []) : value) + " Added into your criteria"));

    //todo BU kısmın daha profesyonel olması lazım.
    //kontroller, manuel should, must lar arasında geçiş...
    this.monitorSearchComponent.setSearchSetting(this.searchSetting);
  }

  public updateSearchSetting(setting: SearchSetting) {
    this.searchSetting = setting;
  }
}
