import {AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {AgentCountModel, HourlyCompanySummaryV5Response} from "../../../core/models/Dashboard";
import {GroupItemDom} from "./childcomponents/group-item.component";
import {DashBoardService} from "../../../core/services/dashBoardService";
import {LiveReportRequest} from "../../../core/models/report";
import {GroupComponent} from "./childcomponents/group.component";
import {CategoryComponent} from "./childcomponents/category.component";
import {AuthenticationService} from "../../../core/services/authentication.service";
import {ConfigService} from "../../../core/services/config.service";
import {DomainComponent} from "./childcomponents/domain.component";

@Component({
  selector: 'app-dashboardv2',
  templateUrl: 'dashboardv2.component.html',
  styleUrls: ['dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Dashboardv2Component implements OnInit, AfterViewInit{
  constructor(private dashboardService: DashBoardService,
              private authService: AuthenticationService, private config: ConfigService) {
  }

  @ViewChild("groupComponent") groupComponent: GroupComponent
  @ViewChild("categoryComponent") categoryComponent: CategoryComponent
  @ViewChild("domainComponent") domainComponent: DomainComponent
  trafficAnomaly: HourlyCompanySummaryV5Response;
  theme: any = 'light';

  ngOnInit() {
    this.loadIntiLiveReport()
    this.getTheme()
  }

  ngAfterViewInit() {
    this.categoryComponent.setTheme(this.theme)
    this.domainComponent.setTheme(this.theme)
  }

  //region init
  loadIntiLiveReport() {
    let req: LiveReportRequest = {}
    this.fetchLiveReport(req, function (res) {
      this.groupComponent.setDataGroup(res.groups, res.actions)
      this.categoryComponent.setCategories(res.cats, res.graphs, res.actions)
      this.domainComponent.setDomains(res.domains, res.actions)
    }.bind(this))
  }

  //endregion

  //region direct ui methodes
  onDateChanged(date: { startDate: Date, endDate: Date, name: string }) {
    if (name == "Last Hour") {
      this.loadIntiLiveReport()
    }
  }

  onGroupChanged(it: GroupItemDom) {
    this.categoryComponent.setGroup(it)
  }

  //endregion

  //region utils methodes
  private getTheme() {
    const currentUser = this.authService.currentSession?.currentUser;
    const theme = this.config.getThemeColor(currentUser?.id);
    // const theme = localStorage.getItem('themeColor') as 'light' | 'dark';

    if (theme) {
      this.theme = theme;
    } else {
      this.theme = 'white';
    }
  }

  //endregion

  //region network service methodes
  fetchLiveReport(req: LiveReportRequest, callback: Function) {
    this.dashboardService.getLiveReport(req).subscribe(res => {
      callback(res)
    })
  }

  //endregion
}
