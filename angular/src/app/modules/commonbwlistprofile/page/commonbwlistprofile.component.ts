
import {takeUntil,  debounceTime, distinct, flatMap, map, mergeMap } from 'rxjs/operators';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AgentService } from 'src/app/core/services/agent.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile } from 'src/app/core/models/SecurityProfile';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { ProfileWizardComponent } from '../../shared/profile-wizard/page/profile-wizard.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { BoxService } from 'src/app/core/services/box.service';
import { BoxConf } from '../../roaming/page/roaming.component';
import { CommonBWListProfileService } from '../../../core/services/commonBWListProfileService';
import { CommonBWListProfile } from '../../../core/models/CommonBWListProfile';
import { RkTableConfigModel, RkTableRowModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { TranslatorService } from '../../../core/services/translator.service';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { LogColumn } from '../../../core/models/LogColumn';
import { ThrowStmt } from '@angular/compiler';
import { ExcelService } from '../../../core/services/excelService';
import { PdfService } from '../../../core/services/pdfService';
import { ExportTypes } from 'roksit-lib/lib/modules/rk-table/rk-table-export/rk-table-export.component';

@Component({
    selector: 'app-commonbwlistprofile',
    templateUrl: 'commonbwlistprofile.component.html',
    styleUrls: ['commonbwlistprofile.component.sass']
})
export class CommonBWListProfileComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {


    constructor(
        private bwService: CommonBWListProfileService,
        private notification: NotificationService,
        private alertService: AlertService,
        private staticMessageService: StaticMessageService,
        private translateService: TranslatorService,
        private excelService: ExcelService,
        private pdfService: PdfService
    ) {
        this.getCommonBWList();
    }
    page = 0;
    pageSize = 10;
    searchKey: string;
    totalCount = 0;
    tableHeight = 100;
    isBlocked = false;
    bwdomains = '';
    searchboxevent: Subscription;

    bwlist: CommonBWListProfile[] = [];

    private ngUnsubscribe: Subject<any> = new Subject<any>();


    saveMode: 'NewBWList' | 'BWListUpdate' | 'NotEditable';

    @ViewChild('bwlistModal') bwlistModal: RkModalModel;
    @ViewChild('searchbox') searchbox: ElementRef<HTMLInputElement>;

    tableConfig: RkTableConfigModel =
        {
            columns: [
                { id: 0, name: 'id', displayText: this.translateService.translate('Id'), isLink: false },
                { id: 1, name: 'domain', displayText: this.translateService.translate('Domain'), isLink: false },
                { id: 2, name: 'isBlocked', displayText: this.translateService.translate('IsBlocked'), isLink: false },
                { id: 3, name: 'insertDate', displayText: this.translateService.translate('InsertDate'), isLink: false },
                { id: 4, name: 'comment', displayText: this.translateService.translate('Comment'), isLink: false },

            ],
            rows: [],
            selectableRows: this.totalCount ? true : false,
            arrowVisible: false
        };

    calculateAfterData() {
        this.tableConfig.selectableRows = this.totalCount ? true : false;
        this.tableHeight = window.innerWidth > 768 ? (window.innerHeight - 373) - (document.body.scrollHeight - document.body.clientHeight) : null;
        this.tableConfig.isSelectedAll = false;
    }


    ngOnInit() { }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.searchboxevent.unsubscribe();

    }

    ngAfterViewChecked() {

    }
    isBWChanged(event) {
        this.isBlocked = event;
    }
    columns: LogColumn[];
    selectedColumns: LogColumn[];

    ngAfterViewInit() {
        this.bwService.initTableColumns().pipe(
            takeUntil(this.ngUnsubscribe)).subscribe((res: LogColumn[]) => {
                this.columns = res;

                const tempcolumns = [];

                for (const data of this.columns) {
                    if (data['checked']) {
                        tempcolumns.push(data);
                    }
                }

                this.selectedColumns = tempcolumns;
                this.selectedColumns.forEach(item => {
                    const col = this.tableConfig.columns.find(colItem => colItem.name === item.name);
                    if (col) {
                        col.selected = true;
                    }
                });

                this.searchboxevent = fromEvent(this.searchbox.nativeElement, 'keyup').pipe(
                    debounceTime(1000),
                    map((i: any) => {
                        if (i.key != 'Enter') {
                            if (this.searchKey?.length > 3) {
                                this.searchCommonBWList().subscribe();
                            }
                            else if (!this.searchKey.length) {
                                this.getCommonBWList().subscribe();
                            }
                        }
                    })).subscribe()
                this.getCommonBWList().subscribe(x => {

                });
            });

    }

    fillResults(res: any) {
        this.bwlist = res.items;
        this.totalCount = res.count;
        this.tableConfig.rows = [];
        this.tableConfig.arrowVisible = true;
        let count = 1;
        this.bwlist.forEach(item => {
            (item as any).id = (this.page * this.pageSize) + count;
            count++;
            item.insertDate = moment(item.insertDate).format('YYYY-MM-DD HH:mm:ss');
            (item as any).isBlocked = item.isBlocked ? "black" : "white";
            const rowItem: RkTableRowModel = item as RkTableRowModel;
            rowItem.selected = false;


            this.tableConfig.rows.push(rowItem);
            this.calculateAfterData();
        })
    }

    getCommonBWList() {
        return this.bwService.getCommonBWListProfile(this.page, this.pageSize).pipe(takeUntil(this.ngUnsubscribe),map(res => {
            this.fillResults(res);
        }),);
    }
    searchCommonBWList() {
        return this.bwService.searchCommonBWListProfile(this.searchKey, this.page, this.pageSize).pipe(takeUntil(this.ngUnsubscribe),map(res => {
            this.fillResults(res);
        }),);
    }
    onPageViewCountChange(event: any) {
        this.pageSize = event;
        this.getCommonBWList().subscribe(y => y);
    }
    onPageChange(event: any) {
        this.page = event - 1;
        this.getCommonBWList().subscribe(y => y);
    }

    saveCommonBWList() {
        const domainlist = this.bwdomains.split(/\n/gm).map(x => x.trim()).filter(y => y);
        if (!domainlist.length) {
            this.notification.warning(this.staticMessageService.pleaseEnterSomeDomains)
            return;
        }
        const list = domainlist.map(x => {
            const abc: CommonBWListProfile = {
                domain: x, isBlocked: this.isBlocked
            }
            return abc;
        })
        this.bwService.saveCommonBWListProfile(list).subscribe(y => {
            this.getCommonBWList().subscribe(x => {

                this.bwlistModal.toggle();
            }, (err) => {
                this.bwlistModal.toggle();
                throw err;
            });
        })
    }
    addToList() {
        this.bwlistModal.toggle();
    }
    deleteFromList() {
        const deleteList = this.bwlist.filter(x => x.selected);
        if (!deleteList.length) {
            this.notification.info(this.staticMessageService.pleaseSelectAtLeastOneItem);
            return;
        }
        this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.selectedDomainsWillBeDeletedMessage}!`).subscribe(
            res => {
                if (res) {
                    this.bwService.deleteCommonBWListProfile(deleteList).subscribe(x => {
                        this.getCommonBWList().subscribe(x => x);
                    })
                }
            }
        );

    }

    onSearchChangeEvent(ev: any) {

    }

    exportAs(extention: ExportTypes) {
        if (this.bwlist && this.bwlist.length > 0) {
            let tableData = JSON.parse(JSON.stringify(this.bwlist)) as any[];


            tableData = tableData.filter(x => x.selected);

            if (tableData.length === 0) {
                tableData = JSON.parse(JSON.stringify(this.bwlist)) as any[];
            }

            tableData.forEach(data => {
                delete data.id;
                delete data.companyId;
                delete data.selected;
            });

            const d = new Date();

            if (extention === 'excel') {
                this.excelService.exportAsExcelFile(tableData, 'CommonBWList-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
            } else if (extention === 'pdf') {
                this.pdfService.exportAsPdfFile('landscape', tableData, 'CommonBWList-' + d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear());
            }
        }
    }



}


