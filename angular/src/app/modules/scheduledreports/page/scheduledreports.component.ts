import { Component } from '@angular/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SearchSetting } from 'src/app/core/models/SearchSetting';
import { ScheduledReport } from 'src/app/core/models/ScheduledReport';
import { ReportService } from 'src/app/core/services/ReportService';

@Component({
    selector: 'app-scheduledreports',
    templateUrl: 'scheduledreports.component.html',
    styleUrls: ['scheduledreports.component.sass']
})
export class ScheduledReportsComponent {
    userReports: SearchSetting[] = [];

    constructor(private notification: NotificationService,
        private alert: AlertService, private reportService: ReportService) {
 
        this.loadReports();
    }

    loadReports() {
        
        this.reportService.getReportList().subscribe((res: SearchSetting[]) => {
            this.userReports = [];
            res.forEach(r => {
                if (!r.system) {
                    this.userReports.push(r);
                }
            });
        });
    }

    changeScheduledPeriod(id: number, p: string) {

        if (this.userReports.find(r => r.id == id) != null) {
            if (p == 'd' || p == 'w') {
                this.userReports.find(r => r.id == id).scheduledReport = new ScheduledReport();
                this.userReports.find(r => r.id == id).scheduledReport.period = p;
                this.saveReport(this.userReports.find(r => r.id == id));
            } else {
                this.userReports.find(r => r.id == id).scheduledReport.period = null;
            }
        }
    }

    saveReport(report: SearchSetting) {
        this.reportService.saveReport(report).subscribe(res => {
            if (res.status == 200) {
                this.notification.success(res.message);
                this.loadReports();
            } else {
                this.notification.error(res.message);
            }
        });

    }

    deleteReport(id: number) {
        let report = this.userReports.find(r => r.id == id);
        this.alert.alertWarningAndCancel('Are You Sure?', 'Settings for this report will be deleted!').subscribe(
            res => {
                if (res) {
                    this.reportService.deleteReport(report).subscribe(res => {
                        if (res.status == 200) {
                            this.notification.success(res.message);
                            this.loadReports();
                        } else {
                            this.notification.error(res.message);
                        }
                    });
                }
            }
        );

    }


}
