"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DashboardComponent = void 0;
var core_1 = require("@angular/core");
var validation_service_1 = require("src/app/core/services/validation.service");
var rxjs_1 = require("rxjs");
var moment = require("moment");
var numeral = require("numeral");
var environment_1 = require("src/environments/environment");
var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(dashboardService, agentService, boxService, roamingService, router, config, translateService, toolService, notificationService, staticMesssageService, translatorService, authService) {
        this.dashboardService = dashboardService;
        this.agentService = agentService;
        this.boxService = boxService;
        this.roamingService = roamingService;
        this.router = router;
        this.config = config;
        this.translateService = translateService;
        this.toolService = toolService;
        this.notificationService = notificationService;
        this.staticMesssageService = staticMesssageService;
        this.translatorService = translatorService;
        this.authService = authService;
        this.dateParameter = 0;
        this.labelArray = [];
        // categoryList = [];
        this.categoryListFiltered = [];
        this.selectedCategory = null;
        this.trafficChartType = 'hit';
        this.uniqueChartType = 'domain';
        this.agentCounts = [];
        this.timeRangeButtons = [];
        this.totalCategoryHits = 0;
        this.navigationUrl = environment_1.environment.navigationUrl;
        this.infoBoxes = {
            total: true,
            safe: false,
            malicious: false,
            variable: false,
            harmful: false,
            restricted: false
        };
        this.selectedCategoryName = 'Total';
        this.selectedBox = 'total';
        this.now = new Date();
        this.theme = 'light';
        this.dateButtons = [
            {
                startDate: new Date(this.now.getFullYear() - 1, this.now.getMonth(), this.now.getDate()),
                endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
                displayText: 'Last Year',
                active: false,
                isToday: false
            },
            {
                startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 3, this.now.getDate()),
                endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
                displayText: 'Last 3 Month',
                active: false,
                isToday: false
            },
            {
                startDate: new Date(this.now.getFullYear(), this.now.getMonth() - 1, this.now.getDate()),
                endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
                displayText: 'Last Month',
                active: false,
                isToday: false
            },
            {
                startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() - 7),
                endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate()),
                displayText: 'Last Week',
                active: true,
                isToday: false
            },
            {
                startDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0),
                endDate: new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.now.getHours(), this.now.getMinutes()),
                displayText: "Today (00:00-" + this.now.getHours() + ":" + this.now.getMinutes() + ")",
                active: false,
                isToday: true
            },
        ];
        this.dateConfig = {
            startHourText: this.translatorService.translate('Date.StartHour'),
            endHourText: this.translatorService.translate('Date.EndHour'),
            applyText: this.translatorService.translate('Date.Apply'),
            cancelText: this.translatorService.translate('Date.Cancel'),
            customText: this.translatorService.translate('Date.Custom'),
            selectDateText: this.translatorService.translate('Date.SelectDate'),
            placeholder: this.translatorService.translate('Date.Placeholder'),
            startDate: this.translatorService.translate('Date.StartDate'),
            endDate: this.translatorService.translate('Date.EndDate')
        };
        this.items = [];
        this.today = new Date();
        this.startDate = new Date();
        this.endDate = new Date();
        this.topDomains = [];
        this.showDetailButton = true;
        var currentSession = this.authService.currentSession;
        this.token = currentSession.token;
        this.refreshToken = currentSession.refreshToken;
    }
    DashboardComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.startDate.setDate(this.today.getDate() - 7);
        this.endDate = new Date();
        this.host = this.config.host;
        this.setDateTextByDates();
        this.getTheme();
        this.startDashboardOperations().subscribe(function (x) {
            var request = { duration: 7 * 24, type: 'total' };
            _this.getTopDomains(request).subscribe(function (x) {
                _this.agentCounts = [];
                _this.agentCounts.push({ name: 'PublicIp', activeCount: 0, passiveCount: 0 });
                _this.agentCounts.push({ name: 'RoamingClient', activeCount: 0, passiveCount: 0 });
                _this.agentCounts.push({ name: 'DnsRelay', activeCount: 0, passiveCount: 0 });
                _this.getAgents().subscribe(function (x) {
                });
            });
        });
    };
    DashboardComponent.prototype.getTheme = function () {
        var _a;
        var currentUser = (_a = this.authService.currentSession) === null || _a === void 0 ? void 0 : _a.currentUser;
        var theme = this.config.getThemeColor(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id);
        // const theme = localStorage.getItem('themeColor') as 'light' | 'dark';
        if (theme) {
            this.theme = theme;
        }
        else {
            this.theme = 'white';
        }
    };
    DashboardComponent.prototype.setDateTextByDates = function () {
        var startDate = moment(this.startDate);
        var endDate = moment(this.endDate);
        var minutes = endDate.diff(startDate, 'minutes');
        this.dateText = this.convertTimeString(minutes);
    };
    DashboardComponent.prototype.getAgents = function () {
        var _this = this;
        var agentsLocation = [];
        var agentsBox = [];
        var boxes = [];
        var agentsRoamingClient = [];
        var distinctAgents = { items: [] };
        var distinctBoxs = { items: [] };
        // wait all requests to finish
        return rxjs_1.forkJoin(this.agentService.getAgentLocation().map(function (x) {
            x.forEach(function (y) { return agentsLocation.push(y); });
        }), this.roamingService.getClients().map(function (x) {
            x.forEach(function (y) { return agentsRoamingClient.push(y); });
        }), this.boxService.getBoxes().map(function (x) {
            x.forEach(function (y) {
                if (y.agent) {
                    agentsBox.push(y.agent);
                }
            });
            x.forEach(function (y) { return boxes.push(y); });
        }), this.dashboardService.getDistinctAgent({ duration: 24 }).map(function (x) {
            x.items.forEach(function (y) { return distinctAgents.items.push(y); });
        }), this.dashboardService.getDistinctBox({ duration: 24 }).map(function (x) {
            x.items.forEach(function (y) { return distinctBoxs.items.push(y); });
        })).map(function () {
            var publicip = { name: 'PageName.PublicIp', activeCount: 0, passiveCount: 0 };
            var roamingclient = { name: 'RoamingClient', activeCount: 0, passiveCount: 0 };
            var dnsrelay = { name: 'DnsRelay', activeCount: 0, passiveCount: 0 };
            var serials = boxes.filter(function (x) { return (x).serial; }).map(function (x) { return (x).serial; });
            // add box serials that are not in distinctagents
            // registered clientlardan gelen verinin box bilgileride distinct childcomponents olarak ekleniyor
            /*  serials.forEach(x => {
               const box = boxes.find(y => (y).serial === x);
               if (!box) { return; }
               const foundedBox = distinctBoxs.items.find(y => y.serial === x);
               if (!foundedBox) { return; }
               if (distinctAgents.items.find(y => y.id === box.id)) { return; }
               distinctAgents.items.push({ id: box.agent.id, count: 1 });
             }); */
            // calcuate location childcomponents
            distinctAgents.items.forEach(function (x) {
                if (agentsLocation.find(function (y) { return y.id === x.id; })) {
                    publicip.activeCount++;
                }
            });
            publicip.passiveCount = agentsLocation.length - publicip.activeCount;
            // calculate roaming clients
            distinctAgents.items.forEach(function (x) {
                if (agentsRoamingClient.find(function (y) { return y.id === x.id; })) {
                    roamingclient.activeCount++;
                }
            });
            roamingclient.passiveCount = agentsRoamingClient.length - roamingclient.activeCount;
            // calculate box
            boxes.forEach(function (x) {
                if (distinctBoxs.items.find(function (y) { return y.serial === x.serial; })) {
                    dnsrelay.activeCount++;
                }
            });
            dnsrelay.passiveCount = agentsBox.length - dnsrelay.activeCount;
            _this.agentCounts = [];
            _this.agentCounts = [publicip, roamingclient, dnsrelay];
        });
    };
    DashboardComponent.prototype.setDateByDateButton = function (dateButtonItem) {
        this.startDate = dateButtonItem.startDate;
        this.endDate = dateButtonItem.endDate;
        this.dateChanged({ startDate: this.startDate, endDate: this.endDate }, false, dateButtonItem.isToday);
        dateButtonItem.active = true;
    };
    DashboardComponent.prototype.translate = function (data) {
        return this.translateService.instant(data);
    };
    DashboardComponent.prototype.getTopDomains = function (request) {
        var _this = this;
        return this.dashboardService.getTopDomains(request).map(function (result) {
            // reset everything
            _this.topDomains = [];
            _this.items = [];
            _this.drawTopDomainChart({ items: [] });
            if (result.items.length) {
                _this.toolService.searchCategories(result.items.map(function (x) { return x.name; })).subscribe(function (cats) {
                    cats.forEach(function (cat) {
                        var finded = result.items.find(function (abc) { return abc.name == cat.domain; });
                        if (finded) {
                            finded.category = cat.categoryList.join(',');
                        }
                    });
                    _this.topDomainsCountTotal = result.items.reduce(function (prev, cur) { return prev + cur.hit; }, 0);
                    _this.topDomains = result.items;
                    if (_this.topDomains.length > 0) {
                        _this.addDomain(_this.topDomains[0]);
                    }
                });
            }
        });
    };
    DashboardComponent.prototype.infoboxChanged = function ($event, type, selectedCategoryName) {
        var _this = this;
        this.selectedCategoryName = selectedCategoryName;
        this.selectedCategory = null;
        this.selectedBox = type;
        Object.keys(this.infoBoxes).forEach(function (elem) {
            _this.infoBoxes[elem] = false;
        });
        this.infoBoxes[type] = true;
        this.drawChartAnomaly();
        this.refreshTopDomains().subscribe();
    };
    DashboardComponent.prototype.calculateDateDiff = function () {
        var startDate = moment([this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate()]);
        var endDate = moment([this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate()]);
        var diff = endDate.diff(startDate, 'days');
        return diff;
    };
    DashboardComponent.prototype.getDataByTime = function (type, interval) {
        if (type === 'prev') {
            this.startDate.setDate(this.startDate.getDate() - interval);
            this.endDate.setDate(this.endDate.getDate() - interval);
        }
        else {
            this.startDate.setDate(this.startDate.getDate() + interval);
            this.endDate.setDate(this.endDate.getDate() + interval);
        }
        this.startDate = new Date(this.startDate);
        this.endDate = new Date(this.endDate);
        // this.date.selectTime({ value: 1, displayText: '' }, { startDate: this.startDate, endDate: this.endDate });
        this.dateChanged({ startDate: this.startDate, endDate: this.endDate }, true);
    };
    DashboardComponent.prototype.getDisabledNextButton = function (type) {
        if (type === 'week') {
            var startDate = new Date(JSON.parse(JSON.stringify(this.startDate)));
            startDate.setDate(7);
            return startDate > this.today;
        }
    };
    DashboardComponent.prototype.calculateShowDetailButton = function () {
        console.log(moment(this.startDate).toISOString() + "-" + moment().add(-7, 'days').toISOString());
        var startDate = moment(this.startDate).toDate().getTime();
        var endDate = moment(this.endDate).toDate().getTime();
        var lastWeek = moment().add(-7, 'days').startOf('day').toDate().getTime();
        var today = moment().toDate().getTime();
        this.showDetailButton = (lastWeek <= startDate && endDate <= today);
    };
    DashboardComponent.prototype.dateChanged = function (ev, isDateComponent, isToday) {
        var _this = this;
        if (isDateComponent === void 0) { isDateComponent = false; }
        if (isToday === void 0) { isToday = false; }
        this.dateButtons.forEach(function (elem) { return elem.active = false; });
        this.startDate = ev.startDate;
        this.endDate = ev.endDate;
        if (moment(this.startDate) > moment(this.endDate)) {
            this.endDate = ev.startDate;
            this.startDate = ev.endDate;
            this.date.startDate = this.startDate;
            this.date.endDate = this.endDate;
        }
        this.setDateTextByDates();
        this.selectedCategory = null;
        var request = {};
        if (isDateComponent || isToday) {
            request.startDate = this.startDate.toISOString();
            request.endDate = this.endDate.toISOString();
        }
        else {
            var diff = this.calculateDateDiff();
            request.duration = diff * 24;
        }
        this.calculateShowDetailButton();
        this.getTrafficAnomaly(request).subscribe(function (x) {
            _this.refreshTopDomains().subscribe();
        });
    };
    DashboardComponent.prototype.drawTopDomainChart = function (response) {
        if (!response || !response.items) {
            return;
        }
        var data = response.items;
        var series = [{
                name: 'Hits',
                type: 'line',
                data: data.map(function (x) { return [moment(x.date).utc(true).toDate().getTime(), x.hit]; })
            }];
        if (this.topDomainChart) {
            this.topDomainChart.updateSeries(series);
            return;
        }
        this.topDomainChart = new ApexCharts(document.querySelector('#topDomainChart'), {
            series: series,
            chart: {
                id: 'unique-chart2',
                foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
                type: 'line',
                height: 280,
                zoom: { enabled: false },
                toolbar: {
                    show: false,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                        customIcons: []
                    },
                    autoSelected: 'zoom'
                }
            },
            colors: ['#ff6c40', '#ff6c40'],
            stroke: {
                width: 4,
                curve: ['smooth']
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                enabled: true,
                shared: true,
                theme: 'dark',
                custom: function (_a) {
                    // const date = new Date(w.globals.seriesX[0][dataPointIndex]);
                    var series = _a.series, seriesIndex = _a.seriesIndex, dataPointIndex = _a.dataPointIndex, w = _a.w;
                    var mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');
                    return "\n            <div class=\"__apexcharts_custom_tooltip\" id=\"top-domain-tooltip\">\n              <div class=\"__apexcharts_custom_tooltip_date\">" + mDate + "</div>\n\n              <div class=\"__apexcharts_custom_tooltip_content\">\n                <span class=\"__apexcharts_custom_tooltip_row\">\n                  <span class=\"color\" style=\"background: #ff6c40\"></span> Hit: <b>" + series[0][dataPointIndex] + "</b>\n                </span>\n              </div>\n            </div>\n          ";
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    show: true,
                    trim: true,
                    showDuplicates: false,
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm'
                    }
                },
                tickAmount: 8,
                tooltip: {
                    enabled: false
                }
            },
            grid: {
                borderColor: this.theme === 'white' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)'
            }
        });
        this.topDomainChart.render();
    };
    DashboardComponent.prototype.drawChartAnomaly = function () {
        var _this = this;
        var _a, _b;
        // calculate categories
        this.categoryListFiltered = [];
        if ((_a = this.trafficAnomaly) === null || _a === void 0 ? void 0 : _a.categories) {
            for (var _i = 0, _c = this.trafficAnomaly.categories; _i < _c.length; _i++) {
                var cat = _c[_i];
                cat.hit = cat.buckets.map(function (x) { return x.sum; }).reduce(function (x, y) { return x + y; }, 0);
                cat.hit_ratio = Math.floor(cat.hit / (this.trafficAnomaly.total.hit) * 100);
                cat.hit_ratio = cat.hit_ratio || 0;
                if (this.selectedBox === 'total') {
                    this.categoryListFiltered.push(cat);
                }
                else if (cat.type === this.selectedBox) {
                    this.categoryListFiltered.push(cat);
                }
            }
        }
        // sort descending
        this.categoryListFiltered = this.categoryListFiltered.sort(function (x, y) {
            if (x.hit === y.hit) {
                return x.name.localeCompare(y.name);
            }
            return (x.hit - y.hit) * -1;
        });
        if (!this.trafficAnomaly.hit && this.trafficChart) {
            this.trafficChart.updateSeries([
                { name: 'Min', type: 'area', data: [] },
                { name: 'Max', type: 'area', data: [] },
                { name: 'Hit', type: 'line', data: [] }
            ]);
            this.trafficChart.updateOptions({
                annotations: {
                    points: []
                }
            });
            // this.categoryListFiltered = [];
            return;
        }
        var istatistic = { averages: [], std_deviations: [], hits: [] };
        // calculate chart
        var whichBox = this.selectedBox === 'harmful' || this.selectedBox === 'restricted' ? this.trafficAnomaly['harmful'] || this.trafficAnomaly['restricted'] : this.trafficAnomaly[this.selectedBox];
        var buckets = this.selectedCategory ? (_b = this.trafficAnomaly.categories.find(function (x) { return x.name === _this.selectedCategory.name; })) === null || _b === void 0 ? void 0 : _b.buckets : whichBox.buckets;
        istatistic.std_deviations = buckets.map(function (x) { return x.std; });
        istatistic.averages = buckets.map(function (x) { return x.avg; });
        istatistic.hits = buckets.map(function (x) { return x.sum; });
        var times = whichBox.buckets.map(function (x) { return moment(x.date).utc(true).toDate().getTime(); });
        var series = [
            { name: 'Min', type: 'area', data: istatistic.averages.map(function (x, index) { return x - istatistic.std_deviations[index]; }).map(function (x, index) { return [times[index], Math.round(x) >= 0 ? Math.round(x) : 0]; }) },
            { name: 'Max', type: 'area', data: istatistic.averages.map(function (x, index) { return x + istatistic.std_deviations[index]; }).map(function (x, index) { return [times[index], Math.round(x)]; }) },
            { name: 'Hit', type: 'line', data: istatistic.hits.map(function (x, index) { return [times[index], Math.round(x)]; }) }
        ];
        var anomalies = series[2].data.filter(function (x, index) {
            var min = series[0].data[index][1];
            var max = series[1].data[index][1];
            var hit = x[1];
            if (hit > max || hit < min) {
                return true;
            }
            return false;
        });
        var yMax = 0;
        series.forEach(function (x) {
            x.data.forEach(function (element) {
                if (element[1] > yMax) {
                    yMax = element[1];
                }
            });
        });
        /*     let xaxismax=0;
            xaxismax=series[1].data.filter(x=>x) */
        // console.log(anomalies);
        var points = this.getAnnotations(series);
        if (this.trafficChart) {
            this.trafficChart.destroy();
            //  this.trafficChart.
            //  return;
        }
        var chartBg = this.theme === 'white' ? '#ffffff' : '#232328';
        this.trafficChart = new ApexCharts(document.querySelector('#chart'), {
            series: series,
            chart: {
                id: 'chart2',
                type: 'line',
                stacked: false,
                group: 'deneme',
                height: 280,
                foreColor: this.theme === 'white' ? '#9aa1a9' : '#7b7b7e',
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: false,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false,
                        customIcons: []
                    },
                    autoSelected: 'zoom'
                },
                events: {
                    click: function () {
                        console.log('clicked');
                    },
                    markerClick: function () {
                    }
                }
            },
            colors: [chartBg, (this.theme === 'white' ? '#b1dcff' : '#004175'), '#0084ff'],
            stroke: {
                width: 2,
                curve: ['smooth', 'smooth', 'straight']
            },
            annotations: {
                points: points
            },
            dataLabels: {
                enabled: false
            },
            tooltip: {
                enabled: true,
                shared: true,
                intersect: false,
                x: {
                    show: true
                },
                // fillSeriesColor: true,
                theme: 'dark',
                custom: function (_a) {
                    // const date = new Date(w.globals.seriesX[0][dataPointIndex]);
                    var series = _a.series, seriesIndex = _a.seriesIndex, dataPointIndex = _a.dataPointIndex, w = _a.w;
                    var mDate = moment(w.globals.seriesX[0][dataPointIndex]).utc(false).format('MMM DD YYYY - HH:mm');
                    // const mDate2 = moment(w.globals.seriesX[0][dataPointIndex]).utc(true).format('MMM DD YYYY - HH:mm');
                    // const mDate3 = moment.utc(w.globals.seriesX[0][dataPointIndex]).local().format('MMM DD YYYY - HH:mm');
                    return "\n            <div class=\"__apexcharts_custom_tooltip\">\n              <div class=\"__apexcharts_custom_tooltip_date\">" + mDate + "</div>\n\n              <div class=\"__apexcharts_custom_tooltip_content\">\n                <span class=\"__apexcharts_custom_tooltip_row\">\n                  <span class=\"color\" style=\"background: var(--primary)\"></span> Min: <b>" + series[0][dataPointIndex] + "</b>\n                </span>\n                <span class=\"__apexcharts_custom_tooltip_row\">\n                  <span class=\"color\" style=\"background: #c41505\"></span> Max: <b>" + series[1][dataPointIndex] + "</b>\n                </span>\n                <span class=\"__apexcharts_custom_tooltip_row\">\n                  <span class=\"color\" style=\"background: " + (_this.theme === 'white' ? '#b5dbff' : '#004175') + "\"></span> Hit: <b>" + series[2][dataPointIndex] + "</b>\n                </span>\n\n                <p>\n                  " + _this.translatorService.translate('TooltipDescription') + "\n                </p>\n                </div>\n            </div>\n          ";
                }
            },
            legend: {
                show: false
            },
            fill: {
                opacity: 1
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    show: true,
                    trim: true,
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm'
                    },
                    tickAmount: 7
                },
                lines: {
                    show: true
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                min: 0,
                max: yMax + 10,
                tickAmount: 5,
                labels: {
                    formatter: function (value) {
                        return _this.getRoundedNumber(value);
                    }
                },
                lines: {
                    show: true
                }
            },
            noData: {
                text: this.translatorService.translate('NoData'),
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: undefined,
                    fontSize: '14px',
                    fontFamily: undefined
                }
            },
            grid: {
                borderColor: this.theme === 'white' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)',
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            }
        });
        this.trafficChart.render();
    };
    DashboardComponent.prototype.getAnnotations = function (data) {
        var points = [];
        for (var i = 0; i < data[0].data.length; i++) {
            var min = data[0].data[i][1];
            var max = data[1].data[i][1];
            var hit = data[2].data[i][1];
            var time = data[0].data[i][0];
            var percentMax = (hit - max) / max * 100;
            var color = '';
            if (percentMax >= 100) {
                color = '#c41505';
            }
            else if (percentMax >= 80) {
                color = '#9c1e6c';
            }
            else if (percentMax >= 60) {
                color = '#7c26bd';
            }
            else if (percentMax >= 40) {
                color = '#6158ca';
            }
            else if (percentMax >= 20) {
                color = '#135F82';
            }
            var elm = {
                x: time,
                y: hit,
                marker: {
                    size: percentMax >= 20 ? 3 : 0,
                    fillColor: color,
                    strokeColor: color,
                    strokeSize: percentMax >= 20 ? 3 : 0,
                    radius: 2
                }
            };
            points.push(elm);
            points.push(isNaN(percentMax) ? 0 : percentMax);
        }
        return points;
    };
    DashboardComponent.prototype.startDashboardOperations = function () {
        this.selectedCategory = null;
        /* this.staticService.getCategoryList().subscribe(res => {
          this.categoryList = res;
        }); */
        return this.getTrafficAnomaly({ duration: 7 * 24 });
    };
    DashboardComponent.prototype.refreshTopDomains = function () {
        var request = { startDate: this.startDate.toISOString(), endDate: this.endDate.toISOString() };
        request.type = this.selectedCategory ? this.selectedCategory.name : this.selectedBox;
        return this.getTopDomains(request);
    };
    DashboardComponent.prototype.getRoundedNumber = function (value) {
        return numeral(value).format('0.0a').replace('.0', '');
        // return Math.abs(value) > 999 ? (Math.sign(value) * (Math.abs(value) / 1000)).toFixed(1) + 'K' : (Math.sign(value) * Math.abs(value)).toFixed(1);
    };
    DashboardComponent.prototype.getTrafficAnomaly = function (request) {
        var _this = this;
        return this.dashboardService.getHourlyCompanySummary(request).map(function (result) {
            if (result) {
                _this.trafficAnomaly = result;
                if (!_this.trafficAnomaly.hit) {
                    _this.notificationService.warning(_this.staticMesssageService.dashboardNoDataFoundMessage);
                }
                _this.drawChartAnomaly();
            }
        });
    };
    DashboardComponent.prototype.selectCategory = function (cat) {
        var _a;
        if (cat.name === ((_a = this.selectedCategory) === null || _a === void 0 ? void 0 : _a.name)) {
            this.selectedCategory = null;
        }
        else {
            this.selectedCategory = cat;
        }
        this.drawChartAnomaly();
        this.refreshTopDomains().subscribe();
    };
    DashboardComponent.prototype.flatten = function (list) {
        var _this = this;
        return list.reduce(function (a, b) { return a.concat(Array.isArray(b) ? _this.flatten(b) : b); }, []);
    };
    DashboardComponent.prototype.addDomain = function (domain) {
        this.items = [{ display: domain.name, value: domain.name }];
        this.search();
    };
    DashboardComponent.prototype.onItemAdded = function ($event) {
        var isDomain = validation_service_1.ValidationService.isDomainValid($event.value);
        if (!isDomain) {
            this.items = [];
        }
    };
    DashboardComponent.prototype.search = function () {
        var _this = this;
        var domain = '';
        this.items.forEach(function (elem) {
            domain = elem.value;
        });
        if (domain.trim().length === 0) {
            return;
        }
        this.dashboardService.getTopDomainValue({ domain: domain, startDate: this.startDate.toISOString(), endDate: this.endDate.toISOString() }).subscribe(function (result) {
            result.items = result.items.sort(function (x, y) {
                var x1 = Date.parse(x.date);
                var y1 = Date.parse(y.date);
                return x1 - y1;
            });
            _this.drawTopDomainChart(result);
        });
    };
    DashboardComponent.prototype.showSummary = function () {
        var _a;
        this.router.navigateByUrl("/admin/reports/custom-reports?category=" + (((_a = this.selectedCategory) === null || _a === void 0 ? void 0 : _a.name) || this.selectedBox) + "&startDate=" + moment(this.startDate).toISOString() + "&endDate=" + moment(this.endDate).toISOString());
    };
    DashboardComponent.prototype.showDetail = function () {
        var _a;
        /*  if (this.getDetailButtonDisabled) {
           this.notificationService.warning(this.translatorService.translate('DateDifferenceWarning'));
         } else { */
        var url = ("/admin/reports/monitor?category=" + (((_a = this.selectedCategory) === null || _a === void 0 ? void 0 : _a.name) || this.selectedBox) + "&startDate=" + moment(this.startDate).toISOString() + "&endDate=" + moment(this.endDate).toISOString());
        this.router.navigateByUrl(url);
        // }
    };
    DashboardComponent.prototype.convertTimeString = function (num) {
        var month = Math.floor(num / (1440 * 30));
        var w = Math.floor((num - (month * 1440 * 30)) / (1440 * 7));
        var d = Math.floor((num - (w * 1440 * 7)) / 1440); // 60*24
        var h = Math.floor((num - (d * 1440)) / 60);
        var m = Math.round(num % 60);
        var text = '';
        if (month > 0) {
            text = month + " " + this.translatorService.translate('Month');
            if (w > 0) {
                text += " " + w + " " + this.translatorService.translate('Week');
            }
        }
        else if (w > 0) {
            text = w + " " + this.translatorService.translate('Week');
            if (d > 0) {
                text += " " + d + " " + this.translatorService.translate('Day');
            }
        }
        else if (d > 0) {
            text = d + " " + this.translatorService.translate('Day');
            if (h > 0) {
                text += " " + h + " " + this.translatorService.translate('Hour');
            }
        }
        else if (h > 0) {
            text = h + " " + this.translatorService.translate('Hour');
            if (m > 0) {
                text += " " + m + " " + this.translatorService.translate('Minute');
            }
        }
        else {
            text = m + " " + this.translatorService.translate('Minute');
        }
        return text;
    };
    __decorate([
        core_1.ViewChild('date')
    ], DashboardComponent.prototype, "date");
    DashboardComponent = __decorate([
        core_1.Component({
            selector: 'app-dashboard',
            templateUrl: 'dashboard.component.html',
            styleUrls: ['dashboard.component.scss']
        })
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;
