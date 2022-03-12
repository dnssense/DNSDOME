import {Component, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {AgentCountModel, HourlyCompanySummaryV5Response} from "../../../core/models/Dashboard";
import {GroupItemDom} from "./childpages/group-item.component";
import {DashBoardService} from "../../../core/services/dashBoardService";
import {LiveReportRequest} from "../../../core/models/report";
import {GroupComponent} from "./childpages/group.component";

@Component({
  selector: 'app-dashboardv2',
  templateUrl: 'dashboardv2.component.html',
  styleUrls: ['dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Dashboardv2Component implements OnInit{
  constructor(private dashboardService: DashBoardService) {
  }
  @ViewChild("groupComponent") groupComponent: GroupComponent
  trafficAnomaly: HourlyCompanySummaryV5Response;
  ngOnInit() {
    this.loadIntiLiveReport()
  }

  //region init
  loadIntiLiveReport() {
    let req: LiveReportRequest = {}
    this.fetchLiveReport(req, function (res) {
      this.groupComponent.setDataGroup(res.groups, res.actions)
    }.bind(this))
  }
  //endregion

  //region direct ui methodes
  onDateChanged(date:{startDate:Date,endDate:Date,name: string}) {
    if (name == "Last Hour") {
      this.loadIntiLiveReport()
    }
  }

  onGroupChanged(it: GroupItemDom) {
    console.log(it.name)
  }
  //endregion

  //region utils methodes

  //endregion

  //region network service methodes
  fetchLiveReport(req: LiveReportRequest, callback: Function) {
    this.dashboardService.getLiveReport(req).subscribe(res => {
      callback(res)
    })
  }
  //endregion
}
