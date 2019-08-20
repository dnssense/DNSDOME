import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile } from 'src/app/core/models/SecurityProfile';
import { AgentService } from 'src/app/core/services/agent.service';
import { AgentType } from 'src/app/core/models/AgentType';
import * as introJs from 'intro.js/intro.js';
import { NotificationService } from 'src/app/core/services/notification.service';

declare let $: any;
export class RoamingClient {
    name: string
    type: string
    group: string
    rootProfile: SecurityProfile

}
@Component({
    selector: 'app-roaming',
    templateUrl: 'roaming.component.html',
    styleUrls: ['roaming.component.sass']
})
export class RoamingComponent implements OnInit {
    clientForm: FormGroup;
    clients: RoamingClient[];
    selectedClient: RoamingClient = new RoamingClient();
    securityProfiles: SecurityProfile[];
    clientType: string;
    isNewItemUpdated: boolean = false;
    fileLink: string;

    constructor(private formBuilder: FormBuilder, private agentService: AgentService, private notification: NotificationService) {

        this.clients = [];
        this.agentService.getSecurityProfiles().subscribe(res => { this.securityProfiles = res });

        this.clients.push({ name: 'John-PC', type: 'Windows', group: 'IT', rootProfile: null });
        this.clients.push({ name: 'Sarah-PC', type: 'Windows', group: 'HR', rootProfile: null });
        this.clients.push({ name: 'Manager', type: 'Windows', group: 'HR', rootProfile: null });
        this.clients.push({ name: 'Office1', type: 'Windows', group: 'IT', rootProfile: null });
        this.clients.push({ name: 'Center Office', type: 'Windows', group: 'IT', rootProfile: null });

        this.agentService.getProgramLink().subscribe(res => this.fileLink = res.link);

        this.clientForm = this.formBuilder.group({
            "name": ["", [Validators.required]],
            "type": ["", [Validators.required]],
            "group": ["", [Validators.required]]
        });
    }

    ngOnInit() {
    }

    onSelectionChangeType() {

    }

    securityProfileChanged(id: number) {
        this.isNewItemUpdated = true;
        this.selectedClient.rootProfile = this.securityProfiles.find(p => p.id == id);
    }

    openTooltipGuide() {
        introJs().start();
    }

    showForm() {
        $('#newClientRow').slideDown(300);
        $('#pi_card_btn').hide();
    }

    hideForm() {
        $('#newClientRow').slideUp(300);
        $('#pi_card_btn').show();
    }


    showNewProfileWizard() {

    }

    copyLink() {
        if (this.fileLink != null) {

            let selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = this.fileLink;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);

            this.notification.info('File link copied to clipboard')
        }
    }


}
