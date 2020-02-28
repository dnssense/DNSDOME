import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import * as introJs from 'intro.js/intro.js';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { BoxService } from 'src/app/core/services/box.service';
import { GroupAgentModel } from '../../devices/page/devices.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { StaticSymbolResolverHost } from '@angular/compiler';
import { StaticMessageService } from 'src/app/core/services/StaticMessageService';

declare let $: any;

@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit {

    constructor(
        private formBuilder: FormBuilder,
        private agentService: AgentService,
        private alertService: AlertService,
        private notification: NotificationService,
        private roamingService: RoamingService,
        private boxService: BoxService,
        private staticMessageService: StaticMessageService
    ) { }

    clientForm: FormGroup;
    clients: Agent[];
    clientsFiltered: Agent[];
    clientGroups: Agent[];
    selectedClients: Agent[] = [];
    clientListForGroup: Agent[] = [];

    selectedClient: Agent = new Agent();

    securityProfiles: SecurityProfile[];
    securityProfilesForSelect: RkSelectModel[] = [];
    selectedProfile: number;

    clientType: string;
    isNewItemUpdated = false;
    fileLink: string;
    searchKey: string;
    selectedAgent: Agent = new Agent();
    saveMode: string;
    startWizard = false;
    dontDomains: string[] = [];
    confParameters: string[] = [];

    isDontDomainsValid = true;

    groupedClients = [];

    domain: string;

    alwaysActive = true;
    disabledNetwork = false;

    @ViewChild('groupModal') groupModal: RkModalModel;

    @ViewChild('roamingClientModal') roamingClientModal: RkModalModel;

    ngOnInit(): void {

        this.clients = [];
        this.clientForm = this.formBuilder.group({
            'name': ['', [Validators.required]],
            'type': ['', [Validators.required]],
            'blockMessage': []
        });

        this.loadClients();
        this.getConfParameters();
        this.defineNewAgentForProfile();
    }

    loadClients() {
        this.agentService.getSecurityProfiles().subscribe(result => {
            this.securityProfiles = result;

            this.fillSecurityProfilesSelect(result);
        });

        this.roamingService.getClients().subscribe(res => {
            debugger;
            this.clients = res;

            this.clientsFiltered = this.clients;

            this.groupedClients = this.getGroupClients(this.clients);
        });
    }

    private fillSecurityProfilesSelect(profiles: SecurityProfile[], id?: number) {
        const _profiles = [];

        profiles.forEach(elem => {
            const obj = {
                displayText: elem.name,
                value: elem.id,
            } as RkSelectModel;

            if (id) {
                obj.selected = elem.id === id;
            }

            _profiles.push(obj);
        });

        this.securityProfilesForSelect = _profiles;
    }

    private getGroupClients(clients: Agent[]) {
        const grouped = [] as GroupAgentModel[];

        clients.forEach(elem => {
            if (elem.agentGroup && elem.agentGroup.id > 0) {
                const finded = grouped.find(x => x.agentGroup.groupName === elem.agentGroup.groupName);

                if (finded) {
                    finded.memberCounts++;
                    finded.agents.push(elem);
                } else {
                    grouped.push({
                        agentGroup: elem.agentGroup,
                        securityProfile: elem.rootProfile,
                        agents: [elem],
                        memberCounts: 1
                    });
                }
            }
        });

        return grouped;
    }

    getConfParameters() {
        this.boxService.getVirtualBox().subscribe(res => {
            if (res.conf) {
                this.dontDomains = res.conf.split(',').map(x => x[0] === '.' ? x.substring(1) : x);
            }
        });
    }

    defineNewAgentForProfile() {

        this.selectedAgent.rootProfile = new SecurityProfile();
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    onSelectionChangeType() {

    }

    securityProfileChanged(id: number) {
        this.isNewItemUpdated = true;
        this.selectedClient.rootProfile = this.securityProfiles.find(p => p.id === id);
    }

    openTooltipGuide() {
        introJs().start();
    }

    showNewProfileWizard() {
        if (!this.isFormValid) {
            return;
        }

        this.selectedAgent = this.selectedClient;
        this.defineNewAgentForProfile();
        this.selectedAgent.rootProfile.name = this.selectedClient.agentAlias + '-Profile';

        this.saveMode = 'NewProfileWithRoaming';
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();
    }

    get isFormValid() {
        return this.selectedClient.agentAlias.trim().length > 0 && this.selectedClient.rootProfile.id > 0;
    }

    showEditWizard(id: number) {
        this.selectedClient = JSON.parse(JSON.stringify(this.clients.find(c => c.id === id)));
        $('#newClientRow').slideDown(300);
    }

    showProfileEditWizard(id: number) {
        const agent = this.clients.find(p => p.id === id);
        if (agent.rootProfile && agent.rootProfile.id > 0) {
            this.selectedAgent = agent;
            this.saveMode = 'ProfileUpdate';
            this.startWizard = true;
        } else {
            this.notification.warning('Profile can not find!');
        }

    }

    hideWizard() {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'If you made changes, your Changes will be cancelled!').subscribe(
            () => {
                this.loadClients();
            }
        );
    }

    hideWizardWithoutConfirm() {
        this.loadClients();
    }

    saveRoamingClient() {
        if (this.selectedClient && this.isFormValid) {
            this.roamingService.saveClient(this.selectedClient).subscribe(
                res => {

                    this.notification.success(this.staticMessageService.savedAgentRoaminClientMessage);
                    this.loadClients();

                });
        } else {
            this.notification.warning('Client form is not valid. Please enter required fields. ');
        }
    }

    deleteClient(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Selected Client will be deleted!').subscribe(
            res => {
                if (res && id && id > 0) {
                    this.roamingService.deleteClient(id).subscribe(result => {

                        this.notification.success(this.staticMessageService.deletedAgentRoamingClientMessage);

                    });
                }
            });
    }
    deletedAgentRoamingClientMessage(): string {
        throw new Error('Method not implemented.');
    }

    searchByKeyword() {
        if (this.searchKey) {
            this.clientsFiltered = this.clients.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
        } else {
            this.clientsFiltered = this.clients;
        }
    }

    copyLink() {
        const domains = this.dontDomains.map(d => { d = '.'.concat(d); return d; }).join(',');
        this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters();
                this.fileLink = res.link;
                this.copyToClipBoard(this.fileLink);
                this.notification.info('File link copied to clipboard');
            } else {
                this.notification.error('Could not create link');
            }
        });
    }

    copyToClipBoard(input: string) {
        const selBox = document.createElement('textarea');
        selBox.value = input;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    saveDomainChanges() {
        const domains = this.dontDomains.map(domain => domain[0] !== '.' ? '.'.concat(domain) : domain).join(',');

        if (this.isDontDomainsValid) {
            this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
                if (res && res.link) {
                    this.getConfParameters();
                } else {
                    this.notification.error('Changes could not save!');
                }
            });
        }
    }

    downloadFile() {
        const domains = this.dontDomains.map(d => { d = '.'.concat(d.trim()); return d; }).join(',');

        this.boxService.getProgramLink({ donttouchdomains: domains }).subscribe(res => {
            if (res && res.link) {
                this.getConfParameters();
                this.fileLink = res.link;
                window.open('http://' + this.fileLink, '_blank');
            } else {
                this.notification.error('Could not create link');
            }
        });
    }

    addDomainToList() {
        if (this.dontDomains && this.dontDomains.length < 10) {
            if (!this.isDontDomainsValid) {
                this.notification.warning('Please fill all fields with valid domains, before a new one');
                return;
            }

            this.dontDomains.push(this.domain);

            this.checkDomain();

            this.domain = '';

            this.saveDomainChanges();
        } else {
            this.notification.warning('You can add max. 10 domains');
        }
    }

    removeElementFromDomainList(index: number) {
        this.dontDomains.splice(index, 1);

        this.checkDomain();

        this.saveDomainChanges();
    }

    checkDomain() {
        this.dontDomains.forEach(domain => domain = domain.toLowerCase());
        this.isDontDomainsValid = true;
        const d = this.dontDomains; // this.dontDomains.split(',');
        if (d.length > 10) {
            this.notification.warning('You can report 10 domains per request');
            this.isDontDomainsValid = false;
        } else {
            for (let i = 0; i < d.length; i++) {
                let f = d[i];
                if (f.toLowerCase().startsWith('http')) {
                    f = f.toLowerCase().replace('http://', '').replace('https://', '');
                }
                const res = f.match(/^[a-z0-9.-]+$/i); // alpha or num or - or .
                if (!res) {
                    this.isDontDomainsValid = false;
                    break;
                }
            }
        }
    }

    moveDeviceInGroup(opType: number, id: number) {
        if (opType === 1) {
            this.selectedClients.push(this.clientListForGroup.find(u => u.id === id));
            this.clientListForGroup.splice(this.clientListForGroup.findIndex(x => x.id === id), 1);
        } else {
            this.clientListForGroup.push(this.selectedClients.find(u => u.id === id));
            this.selectedClients.splice(this.selectedClients.findIndex(x => x.id === id), 1);
        }
    }

    clientsTableCheckboxChanged($event) {
        this.clientsFiltered.forEach(elem => elem.selected = $event);
    }

    alwaysActiveChanged() {
        this.alwaysActive = !this.alwaysActive;
    }

    disabledNetworkChanged() {
        this.disabledNetwork = !this.disabledNetwork;
    }

    addToGroup() {
        this.groupModal.toggle();
    }

    changeGroup() {
        this.groupModal.toggle();
    }

    createGroup() {
        this.groupModal.toggle();
    }

    editClient(client: Agent) {
        this.selectedClient = client;

        this.fillSecurityProfilesSelect(this.securityProfiles, client.rootProfile.id);

        this.roamingClientModal.toggle();
    }

    clearRoamingClientForm() {
        this.selectedClient = new Agent();

        this.fillSecurityProfilesSelect(this.securityProfiles, -1);
    }

    profileSelectChange($event: number) {
        this.selectedClient.rootProfile = this.securityProfiles.find(x => x.id === $event);
    }
}
