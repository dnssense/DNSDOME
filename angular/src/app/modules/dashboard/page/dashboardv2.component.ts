import {AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {
  Bucket,
  Category,
  CategoryDom, Domain,
  HourlyCompanySummaryV5Request,
  HourlyCompanySummaryV5Response, TopDomainsRequestV5
} from "../../../core/models/Dashboard";
import {GroupItemDom} from "./childcomponents/group-item.component";
import {DashBoardService} from "../../../core/services/dashBoardService";
import {Aggregation, GraphDto, LiveReportRequest, LiveReportResponse} from "../../../core/models/report";
import {GroupComponent} from "./childcomponents/group.component";
import {CategoryComponent} from "./childcomponents/category.component";
import {AuthenticationService} from "../../../core/services/authentication.service";
import {ConfigService} from "../../../core/services/config.service";
import {DomainComponent} from "./childcomponents/domain.component";
import {NotificationService} from "../../../core/services/notification.service";
import {StaticMessageService} from "../../../core/services/staticMessageService";
import {ToolsService} from "../../../core/services/toolsService";
import {TopdateComponent} from "./childcomponents/topdate.component";

@Component({
  selector: 'app-dashboardv2',
  templateUrl: 'dashboardv2.component.html',
  styleUrls: ['dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Dashboardv2Component implements OnInit, AfterViewInit {
  constructor(private dashboardService: DashBoardService,
              private authService: AuthenticationService, private config: ConfigService,
              private notificationService: NotificationService,
              private staticMesssageService: StaticMessageService,private toolService: ToolsService) {
  }

  @ViewChild("groupComponent") groupComponent: GroupComponent
  @ViewChild("categoryComponent") categoryComponent: CategoryComponent
  @ViewChild("domainComponent") domainComponent: DomainComponent
  @ViewChild("topdateComponent") topdateComponent: TopdateComponent
  trafficAnomaly: HourlyCompanySummaryV5Response;
  theme: any = 'light';
  selectedDate: { startDate: Date, endDate: Date, duration: number }
  selectedGroup: GroupItemDom
  selectedCategory: CategoryDom
  reportType: 'livereport' | 'nolivereport' = 'livereport'

  ngOnInit() {
    this.loadIntiLiveReport()
    this.getTheme()
    const now = new Date()
    let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, now.getMinutes())
    this.selectedDate = {startDate:startDate, endDate: now, duration: 0}
  }

  ngAfterViewInit() {
    this.categoryComponent.setTheme(this.theme)
    this.domainComponent.setTheme(this.theme)
  }

  //region init
  private loadIntiLiveReport() {
    let req: LiveReportRequest = {group: this.selectedGroup?.datatype, category: this.selectedCategory?.name}
    this.fetchLiveReport(req, function (res) {
      if (!req.group) {
        this.setUiGroupData(res)
      }
      this.setUiCategoriesData(res)
      this.setUiDomainsDomain(res.domains.items, res.actions)
    }.bind(this))
  }

  //endregion

  //region direct ui methodes

  private setUiCategoriesData(res: LiveReportResponse) {
    let isAllowchange = true
    if (this.selectedCategory && this.selectedCategory.name.length > 0) {
      isAllowchange = false
    }
    this.categoryComponent.setCategories(res.cats, res.graphs, res.actions, isAllowchange)

  }

  private setUiGroupData(res: LiveReportResponse) {
    this.groupComponent.setDataGroup(res.groups, res.actions)
  }

  private setUiDomainsDomain(domains: Domain[], actions: {allow: number, block: number}) {
    this.domainComponent.setDomains(domains as Domain[], actions)
  }


  onDateChanged(date: { startDate: Date, endDate: Date, duration: number, name: string }) {
    this.selectedCategory = null
    if (date.name == "Live Report") {
      this.reportType = 'livereport'
      this.trafficAnomaly = null
    } else {
      this.reportType = 'nolivereport'
    }
    this.selectedDate = {startDate: date.startDate, endDate: date.endDate, duration: date.duration}
    if (date.name == "fromcomponent") {
      this.topdateComponent.setDateComponent(this.selectedDate)
    }
    this.categoryComponent.setGroup(this.selectedGroup)
    this.reloadData(true)
  }

  onGroupChanged(it: GroupItemDom) {
    this.categoryComponent.setGroup(it)
    this.domainComponent.setGroup(it)
    this.selectedGroup = it
    this.selectedCategory = null
    this.reloadData()
  }

  onCategoryChanged(it: CategoryDom) {
    this.selectedCategory = it
    this.reloadData()
  }

  //endregion

  //region utils methodes
  private reloadData(isInit: boolean = false) {
    if (this.reportType == 'livereport') {
      this.loadIntiLiveReport()
    } else {
      if (isInit) {
        this.initLoadNotLiveReport()
      } else {
        this.loadNotLiveReport()
      }
    }
  }

  private initLoadNotLiveReport() {
    this.getTrafficAnomaly(this.getHourlySummaryReq(), function (res) {
      this.trafficAnomaly = res
      this.reEditTrafficAnomaly()
      this.setNoLiveReportData()
    }.bind(this))
  }

  private loadNotLiveReport() {
    this.setNoLiveReportData()
  }

  private setNoLiveReportData() {
    let res = this.getLiveResFromAnomaly()
    this.setUiGroupData(res)
    this.setUiCategoriesData(res)
    this.refreshTopDomains()
  }

  private refreshTopDomains() {
    const request = {
      startDate: this.selectedDate.startDate.toISOString(),
      endDate: this.selectedDate.endDate.toISOString()
    } as TopDomainsRequestV5
    request.type = this.selectedCategory ? this.selectedCategory.name : this.selectedGroup?.datatype
    this.setUiDomainsDomain([],{allow: 0, block: 0})
    this.getTopDomains(request, function (res) {
      this.setUiDomainsDomain(res.domains,{allow: res.hit, block: 0})
    }.bind(this))
  }

  onEmptyData() {
    let res = this.getEmptyLiveReportRes()
    this.setUiGroupData(res)
    this.setUiCategoriesData(res)
    this.setUiDomainsDomain(res.domains.items, res.actions)
  }

  //region anomaly data to ui object
  private getLiveResFromAnomaly(): LiveReportResponse {
    let res = this.getEmptyLiveReportRes()
    let groups = this.getGroupAndTotal2DomObj()
    res.actions = {allow: groups.allow, block: groups.block}
    res.groups = {items: groups.groups}
    res.cats = {items: this.getCategories2DomObj()}
    res.graphs = {items: this.getGraphDomObj()}
    return res
  }

  private getGroupAndTotal2DomObj(): { groups: Aggregation[], allow: number, block: number } {
    let groups: Aggregation[] = []
    let result = {groups: groups, allow: 0, block: 0}
    if (this.trafficAnomaly) {
      if (this.trafficAnomaly.total) {
        groups.push({hit: this.trafficAnomaly.total.hit, name: 'total'})
        result.allow = this.trafficAnomaly.total.allow
        result.block = this.trafficAnomaly.total.block
      }
      if (this.trafficAnomaly.harmful) {
        groups.push({hit: this.trafficAnomaly.harmful.hit, name: 'harmful'})
      }
      if (this.trafficAnomaly.malicious) {
        groups.push({hit: this.trafficAnomaly.malicious.hit, name: 'malicious'})
      }
      if (this.trafficAnomaly.safe) {
        groups.push({hit: this.trafficAnomaly.safe.hit, name: 'safe'})
      }
      if (this.trafficAnomaly.variable) {
        groups.push({hit: this.trafficAnomaly.variable.hit, name: 'variable'})
      }
    }
    return result
  }

  private getCategories2DomObj(): Aggregation[] {
    let catAggs: Aggregation[] = []
    let cats = this.getFilterCategory()
    for (let cat of cats) {
      catAggs.push({hit: cat.hit, name: cat.name})
    }
    return catAggs
  }

  private getGraphDomObj(): GraphDto[] {
    let dto: GraphDto[] = []
    if (!this.trafficAnomaly){
      return dto
    }
    if (this.selectedCategory && this.selectedCategory.name.length > 0) {
      if (this.trafficAnomaly?.categories) {
        let cat = this.findCategoryByName(this.selectedCategory.name)
        if (cat) {
          dto = this.getBucket2GraphDomObj(cat.buckets)
        }
      }
    } else if (this.selectedGroup && this.selectedGroup.datatype != 'total') {
      let buckets = this.trafficAnomaly[this.selectedGroup.datatype].buckets
      if (buckets) {
        dto = this.getBucket2GraphDomObj(buckets)
      }
    } else {
      dto = this.getBucket2GraphDomObj(this.trafficAnomaly.total.buckets)
    }
    return dto
  }

  private getBucket2GraphDomObj(buckets: Bucket[]): GraphDto[] {
    let dto: GraphDto[] = []
    for (let bucket of buckets) {
      let min = Math.round(bucket.avg - bucket.std)
      min = min >= 0 ? min : 0
      let max = Math.round(bucket.avg + bucket.std)
      dto.push({datestr: bucket.date, hit: Math.round(bucket.sum), timestemp: 0, max: max, min:min})
    }
    return dto
  }

  private getFilterCategory(): Category[] {
    let categoryFilter: Category[] = []
    if (this.selectedGroup && this.selectedGroup.datatype != 'total') {
      if (this.trafficAnomaly?.categories) {
        if (this.selectedGroup.datatype == 'harmful' || this.selectedGroup.datatype == 'restricted') {
          categoryFilter = this.trafficAnomaly.categories.filter(c => c.type == 'harmful' || c.type == 'restricted')
        } else {
          categoryFilter = this.trafficAnomaly.categories.filter(c => c.type == this.selectedGroup.datatype)
        }

      }
    } else {
      if (this.trafficAnomaly?.categories) {
        categoryFilter = this.trafficAnomaly.categories
      }
    }
    return categoryFilter
  }

  private findCategoryByName(name: string): Category | undefined {
    if (this.trafficAnomaly?.categories) {
      return this.trafficAnomaly.categories.find(cat => cat.name == name)
    }
    return undefined
  }

  private reEditTrafficAnomaly() {
    if (this.trafficAnomaly?.categories) {
      for (const cat of this.trafficAnomaly.categories) {
        cat.hit = cat.buckets.map(x => x.sum).reduce((x, y) => x + y, 0)
      }
      this.trafficAnomaly.categories = this.trafficAnomaly.categories.sort((x, y) => {
        if (x.hit === y.hit) {
          return x.name.localeCompare(y.name)
        }
        return (x.hit - y.hit) * -1
      })
    }
  }

  private getHourlySummaryReq(): HourlyCompanySummaryV5Request {
    const req: HourlyCompanySummaryV5Request = {}
    if (this.selectedDate.duration > 0) {
      req.duration = this.selectedDate.duration
    } else {
      req.startDate = this.selectedDate.startDate.toISOString()
      req.endDate = this.selectedDate.endDate.toISOString()
    }
    return req
  }


  private getEmptyLiveReportRes(): LiveReportResponse {
    return {
      actions: {allow: 0, block: 0},
      cats: {items: []},
      domains: {items: []},
      graphs: {items: []},
      groups: {items: []},
      hitstotal: 0
    }
  }

  //endregion

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
  private fetchLiveReport(req: LiveReportRequest, callback: Function) {
    this.dashboardService.getLiveReport(req).subscribe(res => {
      callback(res)
    })
  }

  private getTrafficAnomaly(request: HourlyCompanySummaryV5Request, calback: Function) {
    this.dashboardService.getHourlyCompanySummary(request).subscribe(result => {
      if (result) {
        if (!result.hit) {
          this.onEmptyData()
          this.notificationService.warning(this.staticMesssageService.dashboardNoDataFoundMessage);
        } else {
          calback(result)
        }
      }
    })
  }

  private getTopDomains(request: TopDomainsRequestV5, callback: Function) {
    let res:{domains: Domain[], hit: number} = {domains:[], hit: 0}
    this.dashboardService.getTopDomains(request).subscribe(result => {
      if (result.items.length) {
        this.toolService.searchCategories(result.items.map(x=>x.name)).subscribe(cats => {
          cats.forEach(cat => {
            const finded = result.items.find(domain=>domain.name == cat.domain)
            if (finded) {
              finded.category = cat.categoryList.join(',')
            }
          })
          res.domains = result.items
          res.hit = result.items.reduce((prev, cur) => prev + cur.hit, 0)
          callback(res)
        })
      }
    })
  }
  //endregion
}
