import { Component } from '@angular/core';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { ReportService } from 'src/app/core/services/reportService';
import { RkAlertService, RkNotificationService } from 'roksit-lib';

@Component({
    selector: 'app-scheduledreports',
    templateUrl: 'scheduledreports.component.html',
    styleUrls: ['scheduledreports.component.sass']
})
export class ScheduledReportsComponent {

    constructor(
        private notification: RkNotificationService,
        private alert: RkAlertService,
        private reportService: ReportService
    ) {
        this.loadReports();
    }

    private allReports: SearchSetting[] = [];

    userReports: SearchSetting[] = [];

    systemReports: SearchSetting[] = [];

    loadReports() {
        this.reportService.getReportList().subscribe((result: SearchSetting[]) => {
            this.allReports = result;
            this.userReports = result.filter(x => !x.system);
            this.systemReports = result.filter(x => x.system);
        });
    }

    changeScheduledPeriodAndStatus(id: number, p: string) {
        const report = this.allReports.find(x => x.id === id);

        if (report) {
            if (p === 'd' || p === 'w' || p === 'm') {
                if (!report.scheduledReport)
                    report.scheduledReport = new ScheduledReport();
                report.scheduledReport.period = p;
                report.scheduledReport.status = 1;
                this.saveReport(report);
            } else {

                // report.scheduledReport.period = 'd';
                report.scheduledReport.status = 0;
                this.saveReport(report);
            }
        }
    }

    saveReport(report: SearchSetting) {
        this.reportService.saveReport(report).subscribe(res => {


            this.loadReports();

        });
    }

    deleteReport(id: number) {
        const report = this.userReports.find(r => r.id === id);

        this.alert.alertWarningAndCancel('Are You Sure?', 'Settings for this report will be deleted!').subscribe(
            res => {
                if (res) {
                    this.reportService.deleteReport(report).subscribe(result => {

                        this.notification.success(result.message);
                        this.loadReports();

                    });
                }
            }
        );
    }
}
