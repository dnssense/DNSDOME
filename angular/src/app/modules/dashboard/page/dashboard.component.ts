import { Component, OnInit, ElementRef, OnDestroy, ViewChild, ViewChildren, QueryList, TemplateRef } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import * as Chartist from 'chartist';
import { DashboardStatsService } from 'src/app/core/services/dashboardstats.service';
import { DashboardStatistic } from 'src/app/core/models/DashboardStatistic';
import { Dashboard } from 'src/app/core/models/Dashboard';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Observable, Subscription } from 'rxjs/Rx';
import { DashboardTopPanelComponent } from '../components/dashboard-top-panel/dashboard-top-panel.component';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { Constants } from 'src/app/Constants';
import { DashBoardService } from 'src/app/core/services/DashBoardService';
import { OperationResult } from 'src/app/core/models/OperationResult';
import { SearchSettingService } from 'src/app/core/services/SearchSettingService';
import { ChartType } from 'src/app/core/models/ChartType';

declare var Highcharts: any;
declare var jQuery: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  providers: [DashboardStatsService, BsModalService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStatistic;
  private ngUnsubscribe: Subject<any> = new Subject<any>();
  @ViewChild(ModalDirective) public modal: ModalDirective;
  types: string[] = ['Top Source Ip Addresses', 'Top Blocked Domains', 'Top Blocked Subdomains'];
  topPanelName: string[] = ['REQUEST', 'MALWARE', 'THREATENING', 'BLOCKED'];
  logos: string[] = ['fa-exchange', 'fa-bug', 'fa-heartbeat', 'fa-ban'];
  public defaultConfig = {};
  @ViewChild('gridstack') gridstack: ElementRef;
  @ViewChild(DashboardTopPanelComponent)
  public dashboardTopPanelComponent: DashboardTopPanelComponent;
  @ViewChildren(DashboardTopPanelComponent)
  public components: QueryList<DashboardTopPanelComponent>;
  public dashboard: Dashboard = null;
  public tempDashboard: Dashboard = null;
  public dashboards: Dashboard[] = [];
  public userDashboards: Dashboard[] = [];
  public systemDashboards: Dashboard[] = [];
  public chartTypes: ChartType[] = [];
  public searchSetting: SearchSetting;
  public grid: any = null;
  public data: any = null;
  public refreshTimeout = null;
  public observable: Observable<any> = null;
  public subscription: Subscription = null;

  // public spinnerService: SpinnerService = new SpinnerService();
  // public spinnerServiceOperation: SpinnerService = new SpinnerService();
  // public spinnerServiceDeleteOperation: SpinnerService = new SpinnerService();

  public operationModal: BsModalRef;
  public deleteModal: BsModalRef;

  public config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  public isDemo: boolean = false;
  constructor(private notificationService: NotificationService, private configService: ConfigService,
    private spinnerService: SpinnerService, private spinnerServiceOperation: SpinnerService, private spinnerServiceDeleteOperation: SpinnerService,
    private modalService: BsModalService, private dashboardService: DashBoardService, private searchSettingService: SearchSettingService,
    private http: HttpClient, private translator: TranslatorService, private dashboardStats: DashboardStatsService) {

    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });

    this.isDemo = Constants.isDemo();

    // burayı açınca ngOnInit deki metodu da aç!!
    // this.dashboardStats.getStatistics().subscribe(
    //     data => {
    //         this.stats = data;
    //         this.createConnectedUserChart();
    //         this.createPieCharts();
    //     }
    // )
    let data: DashboardStatistic = {
      rushDay: "Pazar",
      newUserCount: 12,
      totalUserCount: 130,
      onlineUserCount: 5,
      maleGenderRatio: 56,
      weeklyUsers: [334, 456, 766, 635, 189, 389, 891]
    };

    this.stats = data;

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    //constructordaki metod acilinca burasi silinecek
    this.createConnectedUserChart();
    this.createPieCharts();
  }

  public openDeleteModal(template: TemplateRef<any>) {
    this.deleteModal = this.modalService.show(template, Object.assign({}, this.config, { class: 'modal-sm' }));
  }

  public openOperationModal(template: TemplateRef<any>) {
    this.operationModal = this.modalService.show(template, this.config);
  }

  public showModal() {
    if (this.isDemo) {
      if (localStorage.getItem("ismodel") == null) {
        this.modal.show();
        localStorage.setItem("ismodel", "1")
      }
    }
  }

  public setDashboardRefreshInterval(value: number) {
    if (this.observable != null) {
      this.subscription.unsubscribe();
    }

    if (value != -1) {
      this.observable = Observable.create((observer) => {
        var id = setTimeout(() => {
          observer.next('some event');
          id = setTimeout(() => {
            observer.next('some event');
          }, value * 1000)
        }, value * 1000);

      });

      this.subscription = this.observable.subscribe(
        (data) => {
          this.refreshAllDashboardSettings();
        },
        (error) => {
          alert(error)
        },
        () => {

        });


    }

  }

  public refreshAllDashboardSettings() {
    let compoentsArray = this.components.toArray();
    for (let co of compoentsArray) {
      co.refresh();
    }
  }
  ngAfterViewInit() {

    this.showModal();

    this.spinnerService.show();
    this.dashboardService.list().subscribe((res: Dashboard[]) => {
      this.dashboards = res;
      console.log("@dashboards")
      console.log(this.dashboards);
      for (let d of this.dashboards) {
        if (d.isDefault) {
          this.dashboard = d;
        }
        if (d.system) {
          this.systemDashboards.push(d);
        } else {
          this.userDashboards.push(d);
        }
      }
      if (this.dashboard == null) {
        this.dashboard = this.dashboards[0];
      }

      if (this.dashboard == null) {
        this.dashboard = new Dashboard();
      }

      this.getDashboardSettings(this.dashboard);
      this.spinnerService.hide();

    });

  }

  public updateDashboardList() {

    this.systemDashboards = [];
    this.userDashboards = [];
    for (let d of this.dashboards) {
      if (d.system) {
        this.systemDashboards.push(d);
      } else {
        this.userDashboards.push(d);
      }
    }
    if (this.dashboard == null) {
      this.dashboard = this.dashboards[0];
    }

    this.getDashboardSettings(this.dashboard);

  }

  public initGrid() {

    var options = {
      width: 12,
      verticalMargin: 5,
      cellHeight: 50,
      cellWidth: 50,
      resizable: {
        handles: 'e, se, s, sw, w'

      }
    };

    if (this.grid == null) {
      this.grid = jQuery(this.gridstack.nativeElement).gridstack(options);
      this.data = this.grid.data('gridstack');
    }
    this.data.removeAll();


    setTimeout(() => {
      let datas = this.components.toArray();
      for (let a of datas) {
        a.initGrid(this.data, this.gridstack);
      }
    }, 100);


  }

  public getDashboardSettings(dashboard: Dashboard) {
    if (dashboard == null) {
      return;
    }
    this.dashboardService.getDashboardSettings(dashboard).subscribe((res: SearchSetting[]) => {
      dashboard.setting = res;
      this.initGrid();
      this.setDashboardRefreshInterval(this.dashboard.refresh);

    });


  }

  public addSettingToDashBoard(setting: SearchSetting) {
    if (setting == null || setting.id < 0) {
      this.notificationService.error(this.translator.translate("DASHBOARD.SELECT_SETTING"));
      return;
    }

    for (let se = 0; se < this.dashboard.setting.length; se++) {
      if (setting.id == this.dashboard.setting[se].id) {
        this.notificationService.error(this.translator.translate("DASHBOARD.SETTING_EXISTS"));
        return;
      }
    }


    let conf = this.getEventOutput(setting);

    setting.config = conf;

    if (parseInt(setting.dateInterval) > 1440) {
      setting.dateInterval = "1440";
    }


    this.dashboard.setting.push(setting);

    setTimeout(() => {
      let datas = this.components.toArray();
      for (let a of datas) {
        if (a.setting.id == setting.id) {
          a.initGrid(this.data, this.gridstack);
          break;
        }
      }
    }, 100);

  }

  public getEventOutput(searchSetting: SearchSetting): Object {
    let col = 1,
      row = 1,
      x = 1,
      y = 1,
      width = 400,
      height = 400,
      left = 5,
      top = 5;

    let settings = this.dashboard.setting.sort((n1, n2) => {
      let value = parseInt(n1.config["y"]) - parseInt(n2.config["y"]);
      if (value == 0) {
        return parseInt(n1.config["x"]) - parseInt(n2.config["x"])
      }
      else {
        return value;
      }
    });

    for (let se = 0; se < settings.length; se++) {
      let config = settings[se].config;
      var crow = parseInt(config["row"]);
      var ccol = parseInt(config["col"]);
      y = parseInt(config["y"]) + crow;
      x = ccol + parseInt(config["x"]);
    }

    if (x >= 12) {
      x = 0;
    }


    var result = new Object();
    result["row"] = 6;
    result["col"] = 6;
    result["x"] = x;
    result["y"] = y;

    return result;

  }

  public refreshItem(searchSetting: SearchSetting) {

    let compoentsArray = this.components.toArray();
    if (this.refreshTimeout != null) {
      clearTimeout(this.refreshTimeout);
    }
    for (let co of compoentsArray) {
      if (co && co.setting.id == searchSetting.id) {
        this.refreshTimeout = setTimeout(() => {
          co.setRfreshInterval(searchSetting.refresh)
        }, 100);
        break;
      }
    }


  }

  public removeReport(setting: SearchSetting) {

    for (let se = 0; se < this.dashboard.setting.length; se++) {
      if (setting.id == this.dashboard.setting[se].id) {
        this.dashboard.setting.splice(se, 1);
        break;
        //Notification ...
      }
    }

  }

  public setCurrentDashboard() {
    this.tempDashboard = <Dashboard>JSON.parse(JSON.stringify(this.dashboard));
  }

  public deleteDashboard(dashBoard: Dashboard) {
    this.spinnerServiceDeleteOperation.show();
    //let id = this.notificationService.showWait(OperationResult.getResult("wait", "Dashboard deleted", " Dashboard is being deleted."));
    this.dashboardService.delete(this.dashboard).subscribe((res: OperationResult) => {
      this.dashboard = null;
      if (res.status == 200) {
        let us = 0;
        //listeyi güncelliyoruz..
        for (us = 0; us < this.dashboards.length; us++) {
          if (this.dashboards[us].id == dashBoard.id) {
            this.dashboards.splice(us, 1);
            this.dashboard = res.object;
            break;
          }
        }
      }
      //this.notificationService.clearNotify(res, id);
      this.updateDashboardList();
      this.deleteModal.hide();
    }, () => this.spinnerServiceDeleteOperation.hide(),
      () => this.spinnerServiceDeleteOperation.hide()
    );

  }

  public setDefaultDashboard(dashBoard: Dashboard) {
    //let id = this.notificationService.showWait(OperationResult.getResult("wait", "Default Dashboard", "The default Dashboard is being built."));
    this.dashboardService.setDefaultDashboard(this.dashboard).subscribe((res: OperationResult) => {
      this.dashboard = res.object;
      if (res.status == 200) {
        let us = 0;
        //listeyi güncelliyoruz..
        for (us = 0; us < this.dashboards.length; us++) {
          if (this.dashboards[us].id == this.dashboard.id) {
            this.dashboards.splice(us, 1);
            break;
          } else {
            this.dashboards[us].isDefault = false;
          }
        }
        this.dashboards.push(this.dashboard);
      }
      //this.notificationService.clearNotify(res, id);
      this.updateDashboardList();
    }
    );

  }

  public saveAsDashboard(dashboard: Dashboard) {
    let cloneObject = <Dashboard>JSON.parse(JSON.stringify(dashboard));
    cloneObject.id = -1;
    this.tempDashboard = cloneObject;
    if (this.tempDashboard.setting.length > 0) {
      this.saveDashboard(this.tempDashboard);
    } else {
      this.notificationService.error("Panel not found. Please add panel.");
    }
  }

  public saveDashboard(dashboard: Dashboard) {
    if (dashboard.name == '') {
      this.notificationService.error("Please enter  Dashboard name.");
      return;
    }
    let compoentsArray = this.components.toArray();

    if (dashboard.id != -1) {
      for (let co of compoentsArray) {
        let sett = co.updateConfigPositions();
        for (let a of dashboard.setting) {
          if (a.id == sett.id) {
            let index = dashboard.setting.indexOf(a);
            dashboard.setting.splice(index, 1, sett);
            break;
          }
        }
      }
    }

    this.spinnerServiceOperation.show();
    //let id = this.notificationService.showWait(OperationResult.getResult("wait", "Dashboard Save", " Dashboard is being saved."));
    this.dashboardService.save(dashboard).subscribe((res: OperationResult) => {
      this.dashboard = res.object;
      if (res.status == 200) {
        let us = 0;
        //listeyi güncelliyoruz..
        for (us = 0; us < this.dashboards.length; us++) {
          if (this.dashboards[us].id == this.dashboard.id) {
            this.dashboards.splice(us, 1);
            break;
          }
        }
        this.dashboards.push(this.dashboard);
      }
      //this.notificationService.clearNotify(res, id);
      this.updateDashboardList();
      this.operationModal.hide();
    }, () => this.spinnerServiceOperation.hide(),
      () => this.spinnerServiceOperation.hide()
    );
  }

  public cloneDashboard() {
    let cloneObject = <Dashboard>JSON.parse(JSON.stringify(this.dashboard));
    cloneObject.id = -1;
    cloneObject.name = cloneObject.name + "_COPY";
    this.tempDashboard = cloneObject;
  }

  public createNew() {
    this.tempDashboard = new Dashboard();
  }

  public saveSearchSetting(setting: SearchSetting) {
    //let id = this.notificationService.showWait(OperationResult.getResult("wait", "Search Setting Save", " Search Setting is being saved."));
    this.searchSettingService.saveDashboardSearchSetting(this.dashboard, setting).subscribe((res: OperationResult) => {
      this.searchSetting = res.object;
      if (res.status == 200) {
        this.refreshItem(setting);
      }
      // this.notificationService.clearNotify(res, id);
    }
    );
  }

  public setCurrentSetting(setting: SearchSetting) {
    this.searchSetting = setting;
    if (this.searchSetting != null) {
      this.updateChartTypes();

    }

  }

  public updateSettingConfig(setting: SearchSetting) {
    for (let a of this.dashboard.setting) {
      if (a.id == setting.id) {
        let index = this.dashboard.setting.indexOf(a);
        this.dashboard.setting.splice(index, 1, setting);
      }
    }
  }

  public updateChartTypes() {
    this.chartTypes = new Array();

    /*
     if (this.isSingle()){
     this.chartTypes.push(new ChartType("single","singleValue"));
     }
     */

    if (this.isMap()) {
      this.chartTypes.push(new ChartType("map", "Map"));

    }

    if (this.isHistogram()) {
      this.chartTypes.push(new ChartType("histogram", "Histogram"));

    }
    if (this.isTable()) {
      this.chartTypes.push(new ChartType("table", "Table"));
    }
    if (this.isBar()) {
      this.chartTypes.push(new ChartType("pie", "Pie"));
      this.chartTypes.push(new ChartType("bar", "Bar"));
      // this.chartTypes.push(new ChartType("sparkline","Sparkline"));
    }

  }

  public isSingle(): boolean {
    if (this.searchSetting.topNumber == 1) {
      return true;
    }

    return false;

  }

  public isTable(): boolean {
    if (this.searchSetting.columns && this.searchSetting.columns.columns && this.searchSetting.columns.columns.length >= 1) {
      return true;
    }

    return false;

  }

  public isMultiPie(): boolean {
    if (this.searchSetting.columns && this.searchSetting.columns.columns && this.searchSetting.columns.columns.length >= 1) {
      return true;
    }

    return false;

  }

  public isBar(): boolean {
    if (this.searchSetting.columns && this.searchSetting.columns.columns && this.searchSetting.columns.columns.length == 1) {
      return true;
    }

    return false;

  }

  public isHistogram(): boolean {
    if (!this.searchSetting.columns || !this.searchSetting.columns.columns || this.searchSetting.columns.columns.length == 0) {
      return true;
    }

    if (this.searchSetting.columns.columns.length > 0) {
      let result = true;
      for (let o of this.searchSetting.columns.columns) {
        if (o.column.name != 'time') {
          result = false;
          return false;
        }

      }
      return result;
    }


    return false;

  }

  public isMap(): boolean {
    let result: boolean = false;
    for (let o of this.searchSetting.columns.columns) {
      if (o.column.name == 'sourceIpCountryCode' || o.column.name == 'destinationIpCountryCode') {
        result = true;
        return result;
      }
    }
    return result;
  }

  public setDashboardSearchSetting(setting: SearchSetting) {
    let changeId: number = -1;
    changeId = this.searchSetting.id;
    for (let t = 0; t < this.dashboard.setting.length; t++) {
      if (changeId == this.dashboard.setting[t].id) {
        this.dashboard.setting.splice(t, 1);
        break;
      }
    }
    setting.config = this.searchSetting.config;
    this.dashboard.setting.push(setting);
    this.setCurrentSetting(setting);
  }




  /////////////////////////////////////////////// test cards 
  createConnectedUserChart() {
    const dataColouredRoundedLineChart = {
      labels: ['Pzt', 'Sa', 'Çar', 'Per', 'Cu', 'Cts', 'Paz'],
      series: [this.stats.weeklyUsers]

    };
    const optionsColouredRoundedLineChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 5
      }),
      axisY: {
        showGrid: true,
        offset: 40
      },
      axisX: {
        showGrid: true,
      },
      low: 0,
      high: 1000,
      showPoint: true,
      fullWidth: true,
      height: '300px'
    };

    const colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart,
      optionsColouredRoundedLineChart);

    this.startAnimationForLineChart(colouredRoundedLineChart);
  }

  startAnimationForLineChart(chart: any) {
    let seq: number, delays: number, durations: number;
    seq = 0;
    delays = 80;
    durations = 500;
    chart.on('draw', function (data: any) {

      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  }

  startAnimationForBarChart(chart: any) {
    let seq2: number, delays2: number, durations2: number;
    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data: any) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  }

  createPieCharts() {

    const dataPreferences = {
      labels: ['62%', '32%', '6%'],
      series: [62, 32, 6]
    };

    const optionsPreferences = {
      donut: true,
      height: '255px'
    };

    new Chartist.Pie('#birincipasta', dataPreferences, optionsPreferences);

  }

  language(lang: string) {
    this.configService.setTranslationLanguage(lang);
  }

  getcategory() {
    this.http.post<any>(this.configService.getApiUrl() + "/dashboard/list", {}).subscribe(data => {
      debugger;
    },
      err => {
        debugger;
      });
  }


}
