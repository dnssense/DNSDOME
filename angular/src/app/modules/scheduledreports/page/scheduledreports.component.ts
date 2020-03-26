import { Component } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { ReportService } from 'src/app/core/services/reportService';

@Component({
    selector: 'app-scheduledreports',
    templateUrl: 'scheduledreports.component.html',
    styleUrls: ['scheduledreports.component.sass']
})
export class ScheduledReportsComponent {

    constructor(
        private notification: NotificationService,
        private alert: AlertService,
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

    changeScheduledPeriod(id: number, p: string) {
        const report = this.allReports.find(x => x.id === id);

        if (report) {
            if (p === 'd' || p === 'w' || p === 'm') {
                report.scheduledReport = new ScheduledReport();
                report.scheduledReport.period = p;

                this.saveReport(report);
            } else {
                report.scheduledReport.period = null;
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
