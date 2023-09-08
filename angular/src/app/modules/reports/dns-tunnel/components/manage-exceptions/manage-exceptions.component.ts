import {Component, Inject, inject, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {
  RkTabsViewComponent,
  RkTabViewComponent,
  RkSelectControlComponent,
  RkDropdownComponent,
  RowItemBadgeComponent,
  IconExecuteComponent,
  IconInspectComponent,
  RkTranslatorService,
  RkButtonV2Component,
  RkTextInputComponent,
  Validations,
  RkTooltipComponent,
  RkInlineBadgeModule,
  RkTableInfoComponent,
  BasicDialogComponent,
  CommonDialogCustomConfig, RKInlineBadgeType
} from 'roksit-lib';
import {FeatherModule} from 'angular-feather';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, ValidatorFn} from '@angular/forms';
import {
  BlockListItem,
  DnsTunnelService,
  WhiteListItem
} from '../../../../../core/services/dns-tunnel.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'manage-exceptions',
  standalone: true,
    imports: [CommonModule, TranslateModule, RkTabsViewComponent, RkTabViewComponent, RkSelectControlComponent, RkDropdownComponent, RowItemBadgeComponent, IconExecuteComponent, FeatherModule, IconInspectComponent, BasicDialogComponent, RkButtonV2Component, RkTextInputComponent, RkDropdownComponent, RkTooltipComponent, RkInlineBadgeModule, RkTableInfoComponent],
  templateUrl: './manage-exceptions.component.html',
  styleUrls: ['./manage-exceptions.component.scss']

})
export class ManageExceptionsComponent implements OnDestroy {
    public badgeTypes = RKInlineBadgeType;
    translationPrefix = 'DnsTunnel';
    blockedList: BlockListItem[];
    whiteList: WhiteListItem[];
    selectedTabId = 0;
    translatorService = inject(RkTranslatorService);
    tunnelService = inject(DnsTunnelService);
    newWhiteListItem: WhiteListItem;
    dialog = inject(MatDialog);
    @ViewChild('deleteModalTemplate') deleteModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('deleteAllBlockedDomainModalTemplate') deleteAllBlockedDomainModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('nameElement') nameElement: RkTextInputComponent;
    topDialogRef: MatDialogRef<any>;
    showInfo: boolean;
    infoMsg: string;
    ngUnsubscribe = new Subject<boolean>();
    blockListFetched: boolean;
    whiteListFetched: boolean;
    constructor(
        public dialogRef: MatDialogRef<ManageExceptionsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {}) {
        this.getBlockListItems();
        this.getWhiteListItems();
    }
    getBlockListItems() {
      this.tunnelService.getBlockList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.blockedList = res.results;
        this.blockListFetched = true;
      });
    }
    getWhiteListItems() {
      this.tunnelService.getWhiteList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.whiteList = res.results;
        this.whiteListFetched = true;
      });
    }
    tabSelected = (tabId: number) => {
        this.selectedTabId = tabId;
    }


    deleteWhiteList = (item: WhiteListItem) => {
        this.tunnelService.deleteWhiteList(item.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          if (res.status === 200) {
            this.getWhiteListItems();
            this.displayInfo(this.translatorService.translate(this.translationPrefix + '.WhiteListItemDeletionMsg'));
            this.hideTopDialogModal();
          }
        });
    }
    saveWhiteList = () => {
        if (this.newWhiteListItem) {
            if (!this.newWhiteListItem.record || this.nameElement.showError) {
                this.nameElement.showError = true;
                return;
            }
            if (this.whiteList?.findIndex(d => d.record === this.newWhiteListItem.record.trim()) >= 0) {
                this.nameElement.showError = true;
                this.nameElement.caption = this.translatorService.translate('MSGDomainAlreadyExist');
                return;
            }
            this.tunnelService.saveWhiteList(this.newWhiteListItem.record).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
              if (res.status === 200) {
                this.getWhiteListItems();
                this.displayInfo(this.translatorService.translate(this.translationPrefix + '.WhiteListItemSaveMsg'));
                this.newWhiteListItem = null;
              }
            });
        }
    }

    closeDialog(config?: any) {
        this.dialogRef.close(config);
        if (this.topDialogRef) {
           this.topDialogRef.close();
        }
    }

    openConfirmDeleteWhiteListDialog(item: WhiteListItem) {
        this.topDialogRef  =  this.dialog.open(this.deleteModalTemplate, {data: {item: item}, ...CommonDialogCustomConfig});
    }

    openSaveWhiteListDialog(item: WhiteListItem) {
        this.newWhiteListItem = new WhiteListItem(item);
    }

    hideTopDialogModal() {
        if (this.topDialogRef) {
            this.topDialogRef.close();
        }
    }

    backToMainModal() {
        this.newWhiteListItem = null;
    }


    addNewWhiteList() {
       const item = new WhiteListItem({record: '', recordDetail: '', id: 0, companyId: 0});
       this.openSaveWhiteListDialog(item);
    }
    parseDomain(domain: string): string {
        return  domain?.replace('http://', '')
            .replace('https://', '').replace('www.', '').split('/')[0];
    }

    customDomainValidation = (): ValidatorFn => {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const inputValue = control.value;
            const parsedDomainName = this.parseDomain(inputValue);
            if (parsedDomainName && (Validations.isValidSubDomain(parsedDomainName.trim()) || Validations.isValidDomain(parsedDomainName.trim()))) {
                this.nameElement.caption = '';
                return null;
            }
            this.nameElement.caption = this.translatorService.translate('MSGEnterValidDomainSubdomain');
            return {message: 'invalid'};
        };
    }
    displayInfo(infoMsg: string) {
        this.infoMsg = infoMsg;
        this.showInfo = true;
        setTimeout(() => {
            this.showInfo = false;
            this.infoMsg = '';
        }, 2000);
    }

  ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }

  openConfirmDeleteAllDialog() {
    this.topDialogRef  =  this.dialog.open(this.deleteAllBlockedDomainModalTemplate, {data: {}, ...CommonDialogCustomConfig});
  }

  deleteAllBlockedList() {
    this.tunnelService.deleteAllBlockedList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res.status === 200) {
        this.getBlockListItems();
        this.displayInfo(this.translatorService.translate(this.translationPrefix + '.AllBlockListItemDeletionMsg'));
        this.hideTopDialogModal();
      }
    });
  }
}
