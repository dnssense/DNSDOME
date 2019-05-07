import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TimeProfileResponse } from 'src/app/core/models/TimeProfileResponse';
import { AgentService } from 'src/app/core/services/agent.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MobileCategory } from 'src/app/core/models/MobileCategory';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Agent } from 'src/app/core/models/Agent';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';

declare var $: any;

@Component({
    selector: 'app-securityprofiles',
    templateUrl: 'securityprofiles.component.html',
    styleUrls: ['securityprofiles.component.sass']
})
export class SecurityProfilesComponent implements OnInit {

    securityProfiles: SecurityProfile[];
    selectedAgent: Agent;
    profileList: SecurityProfile[];
    startWizard: boolean=false;

    constructor(private agentService: AgentService, private notification: NotificationService,
        private alert: AlertService) {

            this.agentService.getSecurityProfiles().subscribe(res=> {
                this.securityProfiles = res;
                console.log(res);
                
            });

        this.defineNewAgentForProfile();
    }

    ngOnInit() {

    }

    defineNewAgentForProfile() {
        debugger;
        this.selectedAgent = new Agent();
        this.selectedAgent.rootProfile = new SecurityProfile();
        this.selectedAgent.rootProfile.name = "Agent1-Profile";
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    showEditWizard(id: number) {
        if (id) {
            $('#securityProfilesPanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
            
            this.selectedAgent.rootProfile = this.securityProfiles.find(p=> p.id ==id);


            this.startWizard = true;
            document.getElementById('wizardPanel').scrollIntoView();
        }
    }

    hideWizard() {
        this.alert.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                if (res) {
                    $('#wizardPanel').hide("slide", { direction: "right" }, 1000);
                    $('#securityProfilesPanel').show("slide", { direction: "left" }, 1000);
                    //refresh models 
                }
            }
        );
    }


    saveProfile() {
        this.notification.success("You pressed save button");
    }

    deleteProfile(id: number) {

    }
 

}
