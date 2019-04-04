import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApplicationProfile } from 'src/app/core/models/ApplicationProfile';
import { ApplicationProfilesService } from 'src/app/core/services/ApplicationProfilesService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DomainProfile } from 'src/app/core/models/DomainProfile';
import { BWList } from 'src/app/core/models/BWList';
import { DomainProfilesService } from 'src/app/core/services/DomainProfilesService';
import { BlackWhiteListService } from 'src/app/core/services/BlackWhiteListService';
import { PublicIPService } from 'src/app/core/services/PublicIPService';
import { PublicIP } from 'src/app/core/models/PublicIP';

declare var $: any;

export class IpNumber {
  ip: string = "";
  range: number = 0;
}

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass']
})
export class PublicipComponent implements OnInit {
  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  publicIps: PublicIP[];
  publicIpsFiltered: PublicIP[];
  publicIpForm: FormGroup;
  agentName: string;
  ipList: IpNumber[];
  blockMessage: string;

  appProfiles: ApplicationProfile[];
  applicationSystemProfiles: ApplicationProfile[];
  applicationUserProfiles: ApplicationProfile[];

  domainProfiles: DomainProfile[];
  userProfiles: DomainProfile[];
  systemProfiles: DomainProfile[];

  bwList: BWList[];
  userBWList: BWList[];
  systemBWList: BWList[];
  ipRanges: Number[] = [24, 25, 26, 27, 28, 29, 30, 32];
  selectedIp: PublicIP = new PublicIP();
  ipType: string = 'staticIp';
  dnsFqdn: string;
  dataTable: DataTable = {} as DataTable;
  dataTableRows: string[][] = [];
  searchKey: string;

  constructor(private alertService: AlertService, private notification: NotificationService, private bwService: BlackWhiteListService,
    private formBuilder: FormBuilder, private apService: ApplicationProfilesService, private dpService: DomainProfilesService,
    private publicIpService: PublicIPService) {
   
    this.getPublicIpsData();

    this.publicIpForm = this.formBuilder.group({
      "agentName": ["", [Validators.required]],
      "blockMessage": ["", [Validators.required]],
      "dnsFqdn": ["", []],
      "ip0": ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]]
    });

  }

  getPublicIpsData() {
    this.publicIpService.getPublicIPs().subscribe(data => {
      this.publicIps = data;
      this.publicIpsFiltered = data;

    });
  }

  ngOnInit() {
    this.selectedIp = new PublicIP();
    this.selectedIp.profile = new DomainProfile();
    this.selectedIp.appUserProfile = new ApplicationProfile();
    this.selectedIp.bwList = new BWList();

    this.dpService.getProfileData().subscribe((res: DomainProfile[]) => {
      if (res != null) {
        this.domainProfiles = res;
        this.updateDomainProfilelist();
      }
    });
    this.apService.getProfileData().subscribe((res: ApplicationProfile[]) => {
      if (res != null) {
        this.appProfiles = res;
        this.updateApplicationProfilelist();
      }
    });
    this.bwService.getBwList().subscribe((res: BWList[]) => {
      if (res != null) {
        this.bwList = res;
        this.updateBWList();
      }
    });
  }
 

  updateApplicationProfilelist() {
    let systemProfiles = new Array();
    let userProfiles = new Array();
    for (let a of this.appProfiles) {
      if (a.system) {
        systemProfiles.push(a);
      } else {
        userProfiles.push(a);
      }
    }

    this.applicationUserProfiles = userProfiles;
    this.applicationSystemProfiles = systemProfiles;
  }

  updateBWList() {
    const systemBWList = new Array();
    const userBWList = new Array();
    for (const a of this.bwList) {
      if (a.system) {
        systemBWList.push(a);
      } else {
        userBWList.push(a);
      }
    }
    this.userBWList = userBWList;
    this.systemBWList = systemBWList;
  }

  updateDomainProfilelist() {
    const systemProfiles = new Array();
    const userProfiles = new Array();
    for (let a of this.domainProfiles) {
      if (a.locked) {
        systemProfiles.push(a);
      } else {
        userProfiles.push(a);
      }
    }

    this.userProfiles = userProfiles;
    this.systemProfiles = systemProfiles;
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  checkIPNumber(event: KeyboardEvent, inputValue: string) {

    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", "."];
    let isValid: boolean = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }
    if (inputValue && (event.key != 'Backspace' && event.key != 'ArrowLeft' && event.key != 'ArrowRight')) {
      if (event.key != '.') {
        inputValue += event.key;
      }
      let lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
      let lastOclet = Number(lastOcletStr);
      if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
        isValid = false;
      }
      if (isValid && event.key == '.') {
        let oclets: string[] = inputValue.split('.');
        for (let i = 0; i < oclets.length; i++) {
          const oclet = oclets[i];
          if (Number(oclet) < 0 || Number(oclet) > 255) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid && ((inputValue.length == 2 && inputValue == '10' && event.key == '.') ||
        inputValue == '192.168' || inputValue == '127.0.0.1')) {
        isValid = false;
        this.notification.warning('Please enter a valid Public IP Adress!', false);
      }

      if (isValid && inputValue.length >= 4 && (inputValue.substring(0, 4) == '172.')) {
        
        let secondOcletStr = inputValue.substring(inputValue.indexOf('.') + 1);
        let secondOclet = Number(secondOcletStr);
        if (secondOclet >= 16 && secondOclet <= 31) {
          isValid = false;
          this.notification.warning('Please enter a valid Public IP Adress!', false);
        }
      }

      if (isValid && event.key == '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
        isValid = false;
      }
    } else if (isValid && event.key == '.') {
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  }

  ngOnChanges() {
    const input = $(this);

    if (input[0].files && input[0].files[0]) {
      const reader: any = new FileReader();

      reader.onload = function (e: any) {
        $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
      };
      reader.readAsDataURL(input[0].files[0]);
    }
  }

  showNewWizard() {

    this.ipList = [];
    this.ipList.push(new IpNumber());
    this.selectedIp = new PublicIP();
    this.selectedIp.profile = this.domainProfiles[0];
    this.selectedIp.appUserProfile = this.appProfiles[0];
    this.selectedIp.bwList = this.bwList[0];

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
 
  }

  showEditWizard(id: string) {
    this.ipList = [];
    this.ipList.push(new IpNumber());
    this.selectedIp = this.publicIps.find(p => p.id == Number(id));

    if (this.selectedIp && this.selectedIp.ips && this.selectedIp.ips.length > 0) {
      for (let i = 0; i < this.selectedIp.ips.length; i++) {
        let ipn = new IpNumber();
        ipn.ip = this.selectedIp.ips[i].slice(0, 4).join('.');

        const mask = Number(this.selectedIp.ips[i][4]) - Number(this.selectedIp.ips[i][3]);
        ipn.range = this.publicIpService.getRangeOrSubnetMask(1, mask);

        this.ipList[i] = ipn;
        const cname = 'ip' + (this.ipList.length - 1);
        this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
        this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
        this.publicIpForm.controls[cname].updateValueAndValidity();

      }
    }

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
 

  }

  hideWizard() {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
      res => {
        if (res) {
          this.publicIpService.getPublicIPs().subscribe(data => { this.publicIps = data; });
          $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
          $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
        }
      }
    );
  }

  saveIP() {
    if (!this.publicIpForm.valid) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    }
    if (this.ipType == 'staticIp' && !this.ipList && this.ipList.length < 1) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    } else if (this.ipType == 'dynamicIp' && !this.dnsFqdn) {
      this.notification.warning("Form is not valid! Please enter required fields with valid values.");
      return;
    } else if (!this.ipType) {
      return;
    }

    this.selectedIp.ips = [];
    if (this.ipType == 'staticIp') {
      for (let i = 0; i < this.ipList.length; i++) {
        const p = this.ipList[i];
        let ip: string[] = p.ip.split('.');
        ip.push(this.publicIpService.getRangeOrSubnetMask(2, p.range).toString());
        this.selectedIp.ips.push(ip);
      }
    } else if (this.ipType == 'dynamicIp') {
      //TODO: this.dnsFqdn alanı bir yere bağlı değil şuanda.
    }


    this.publicIpService.save(this.selectedIp).subscribe(
      res => {
        if (res.status == 200) {
          this.alertService.alertSuccessMessage("Operation Successful", "Public IP successfully saved.");
          this.publicIpService.getPublicIPs().subscribe(data => this.publicIps = data);
          $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
          $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
        } else {
          this.notification.error("Operation Failed! " + res.message);
        }
      });

  }

  deletePublicIp(id: number) {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Selected Public IP and its settings will be deleted!').subscribe(
      res => {
        if (res) {
          this.publicIpService.delete(this.publicIps.find(p => p.id == id)).subscribe(res => {
            if (res.status == 200) {
              this.alertService.alertSuccessMessage("Operation Successful", "Public IP successfully Deleted.");
              this.publicIpService.getPublicIPs().subscribe(data => this.publicIps = data);
            } else {
              this.notification.error("Operation Failed! " + res.message);
            }
          });
        }
      }
    );
  }

  onSelectionChangeIPType(type: string) {

    if (type === 'dynamicIp') {
      this.ipType = type;
      $("#dnsFqnDiv").show(300);
      $('#staticIPBlock').hide(200);
      this.publicIpForm.controls["dnsFqdn"].setValidators([Validators.required]);
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    } else {
      this.ipType = type;
      $("#dnsFqnDiv").hide(300);
      $('#staticIPBlock').show(300);
      this.publicIpForm.controls["dnsFqdn"].clearValidators();
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    }

  }

  addIpRangeToList() {
    if (this.ipList.length < 10) {
      this.ipList.push(new IpNumber());
      const cname = 'ip' + (this.ipList.length - 1);
      this.publicIpForm.addControl(cname, new FormControl(cname, Validators.required));
      this.publicIpForm.controls[cname].setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]);
      this.publicIpForm.controls[cname].updateValueAndValidity();
    }
  }

  removeElementFromIpList(index: number) {
    const cname = 'ip' + index;
    this.ipList.splice(index, 1);
    this.publicIpForm.controls[cname].clearValidators();
    this.publicIpForm.controls[cname].updateValueAndValidity();  
  }

  ipSplit1: String[];
  ipSplit(str: String) {
    this.ipSplit1 = str.toString().split(',');
    return this.ipSplit1[0] + '.' + this.ipSplit1[1] + '.' + this.ipSplit1[2] + '.' + this.ipSplit1[3] + '-' + this.ipSplit1[4];
  }

  selectFile($event) {
    
    var inputValue = $event.target;
    let file = inputValue.files[0];
    let reader = new FileReader();
    let ag = this.selectedIp;
    if (typeof file !== 'undefined') {

    }

    reader.addEventListener("load", function () {
      ag.logo = reader.result;
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }

    console.log(this.selectedIp);

  }

  searchByKeyword(e: any) {
    if (this.searchKey && this.searchKey.length > 0) {
      this.publicIpsFiltered = this.publicIps.filter(f => f.agentAlias.toLowerCase().includes(this.searchKey.toLowerCase()));
    } else {
      this.publicIpsFiltered = this.publicIps;
    }
  }
}
