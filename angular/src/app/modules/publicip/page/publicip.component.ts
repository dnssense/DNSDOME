import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApplicationProfile } from 'src/app/core/models/ApplicationProfile';
import { ApplicationProfilesService } from 'src/app/core/services/ApplicationProfilesService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DomainProfile } from 'src/app/core/models/DomainProfile';
import { BWList } from 'src/app/core/models/BWList';
import { DomainProfilesService } from 'src/app/core/services/DomainProfilesService';
import { BWListService } from 'src/app/core/services/BWListService';
import { PublicIPService } from 'src/app/core/services/PublicIPService';
import { PublicIP } from 'src/app/core/models/PublicIP';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { AgentService } from 'src/app/core/services/agent.service';

declare var $: any;

export class IpNumber {
  ip: string = "";
  range: number = 0;
}

@Component({
  selector: 'app-publicip',
  templateUrl: './publicip.component.html',
  styleUrls: ['./publicip.component.sass']
})
export class PublicipComponent implements OnInit {
  ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
  publicIpForm: FormGroup;
  agentName: string;
  ipList: IpNumber[] = [];
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

  publicIps: PublicIP[];
  selectedIp: PublicIP = new PublicIP();

  constructor(private alertService: AlertService, private notification: NotificationService, private bwService: BWListService,
    private formBuilder: FormBuilder, private apService: ApplicationProfilesService, private dpService: DomainProfilesService,
    private publicIpService: PublicIPService, private spinner: SpinnerService, private agentService: AgentService) {

    this.publicIpService.getPublicIPs().subscribe(data => this.publicIps = data);

    this.ipList.push(new IpNumber());
    this.publicIpForm = this.formBuilder.group({
      "agentName": ["", [Validators.required]],
      "blockMessage": ["", [Validators.required]],
      "dnsFqdn": ["", []],
      "ip0": ["", [Validators.required, Validators.maxLength(15), Validators.pattern(this.ipv4Pattern)]]
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
        debugger;
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

  changeLabel(value: number) {

    switch (value) {
      case 1:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Allowed"
        $('.slider')[0].style.backgroundColor = 'green';
        break;
      case 2:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Profile A"
        $('.slider')[0].style.backgroundColor = 'blue';
        break;
      case 3:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Profile B"
        $('.slider')[0].style.backgroundColor = 'blue';
        break;
      case 4:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Profile C"
        $('.slider')[0].style.backgroundColor = 'orange';
        break;
      case 5:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Not Allowed"
        $('.slider')[0].style.backgroundColor = 'red';
        break;
      default:
        document.getElementsByClassName("noUi-tooltip")[0].innerHTML = "Not Selected"
        $('.slider')[0].style.backgroundColor = 'green';
        break;
    }


  }

  installWizard() {

    // Code for the Validator
    const $validator = $('.card-wizard form').validate({
      rules: {
        agentName: {
          required: true,
          minlength: 3
        }
      },

      highlight: function (element) {
        $(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
      },
      success: function (element) {
        $(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
      },
      errorPlacement: function (error, element) {
        $(element).append(error);
      }
    });

    // Wizard Initialization
    $('.card-wizard').bootstrapWizard({
      'tabClass': 'nav nav-pills',
      'nextSelector': '.btn-next',
      'previousSelector': '.btn-previous',

      onNext: function () {
        var $valid = $('.card-wizard form').valid();
        document.getElementById('wizardPanel').scrollIntoView();
        if (!$valid) {
          $validator.focusInvalid();
          return false;
        }
      },

      onInit: function (tab: any, navigation: any, index: any) {

        // check number of tabs and fill the entire row
        let $total = navigation.find('li').length;
        let $wizard = navigation.closest('.card-wizard');

        let $first_li = navigation.find('li:first-child a').html();
        let $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
        $('.card-wizard .wizard-navigation').append($moving_div);

        $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
          move_distance -= 8;
        } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

        });
        $('.moving-tab').css('transition', 'transform 0s');
      },

      onTabClick: function () {

        const $valid = $('.card-wizard form').valid();

        if (!$valid) {
          return false;
        } else {
          return true;
        }
      },

      onTabShow: function (tab: any, navigation: any, index: any) {
        let $total = navigation.find('li').length;
        let $current = index + 1;

        const $wizard = navigation.closest('.card-wizard');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard).find('.btn-next').hide();
          $($wizard).find('.btn-finish').show();
        } else {
          $($wizard).find('.btn-next').show();
          $($wizard).find('.btn-finish').hide();
        }

        const button_text = navigation.find('li:nth-child(' + $current + ') a').html();

        setTimeout(function () {
          $('.moving-tab').text(button_text);
        }, 150);

        const checkbox = $('.footer-checkbox');

        if (index !== 0) {
          $(checkbox).css({
            'opacity': '0',
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          $(checkbox).css({
            'opacity': '1',
            'visibility': 'visible'
          });
        }
        $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        $current = index + 1;

        if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
          move_distance -= 8;
        } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

        });
      }
    });

    // Prepare the preview for profile picture
    $('#wizard-picture').change(function () {
      const input = $(this);

      if (input[0].files && input[0].files[0]) {
        const reader = new FileReader();

        reader.onload = function (e: any) {
          $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
        };
        reader.readAsDataURL(input[0].files[0]);
      }
    });

    $('[data-toggle="wizard-radio"]').click(function () {
      const wizard = $(this).closest('.card-wizard');
      wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
      $(this).addClass('active');
      $(wizard).find('[type="radio"]').removeAttr('checked');
      $(this).find('[type="radio"]').attr('checked', 'true');
    });

    $('[data-toggle="wizard-checkbox"]').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).find('[type="checkbox"]').removeAttr('checked');
      } else {
        $(this).addClass('active');
        $(this).find('[type="checkbox"]').attr('checked', 'true');
      }
    });

    $('.set-full-height').css('height', 'auto');

    document.getElementById("previous").onclick = function () {
      document.getElementById('wizardPanel').scrollIntoView();
    };

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

  ngAfterViewInit() {

    $(window).resize(() => {
      $('.card-wizard').each(function () {

        const $wizard = $(this);
        const index = $wizard.bootstrapWizard('currentIndex');
        let $total = $wizard.find('.nav li').length;
        let $li_width = 100 / $total;

        let total_steps = $wizard.find('.nav li').length;
        let move_distance = $wizard.width() / total_steps;
        let index_temp = index;
        let vertical_level = 0;

        let mobile_device = $(document).width() < 600 && $total > 3;

        if (mobile_device) {
          move_distance = $wizard.width() / 2;
          index_temp = index % 2;
          $li_width = 50;
        }

        $wizard.find('.nav li').css('width', $li_width + '%');

        let step_width = move_distance;
        move_distance = move_distance * index_temp;

        let $current = index + 1;

        if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
          move_distance -= 8;
        } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
          move_distance += 8;
        }

        if (mobile_device) {
          let x: any = index / 2;
          vertical_level = parseInt(x);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });

        $('.moving-tab').css({
          'transition': 'transform 0s'
        });
      });
    });
  }

  showNewWizard() {

    this.selectedIp = new PublicIP();
    this.selectedIp.profile = this.domainProfiles[0];
    this.selectedIp.appUserProfile = this.appProfiles[0];
    this.selectedIp.bwList = this.bwList[0];

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

    this.installWizard();
    $('#contentLink').click();
  }

  showEditWizard(id: Number) {
    debugger;
    this.ipList = [];
    this.selectedIp = this.publicIps.find(p => p.id == id);

    if (this.selectedIp && this.selectedIp.ips && this.selectedIp.ips.length > 0) {
      for (let i = 0; i < this.selectedIp.ips.length; i++) {
        let ipn = new IpNumber();
        ipn.ip = this.selectedIp.ips[i].slice(0, 4).join('.');

        const mask = Number(this.selectedIp.ips[i][4]) - Number(this.selectedIp.ips[i][3]);
        ipn.range = this.publicIpService.getRangeOrSubnetMask(1, mask);

        if (i > 0) {
          this.ipList.push(new IpNumber());
        }
        this.ipList[i] = ipn;
      }
    }

    $('#publicIpPanel').toggle("slide", { direction: "left" }, 600);
    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

    this.installWizard();
    $('#contentLink').click();
  }
  hideWizard() {
    this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
      res => {
        if (res) {
          $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
          $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);
        }
      }
    );
  }

  saveIP() {
    if (!this.selectedIp.agentAlias) {
      return;
    }
    this.selectedIp.ips = [];
    for (let i = 0; i < this.ipList.length; i++) {
      const p = this.ipList[i];
      let ip: string[] = p.ip.split('.');
      ip.push(this.publicIpService.getRangeOrSubnetMask(2, p.range).toString());
      this.selectedIp.ips.push(ip);
    }

    this.publicIpService.save(this.selectedIp).subscribe(
      res => {
        this.alertService.alertSuccessMessage("Operation Successful", "Agent successfully saved.");
        this.publicIpService.getPublicIPs().subscribe(data => this.publicIps = data);
        console.log(res);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
        $('#publicIpPanel').toggle("slide", { direction: "left" }, 1000);

      }
    );


    this.alertService.alertBasic(this.ipList.toString());

    //this.alertService.alertSuccessMessage("Operation Successful", "Options changed for agent: ");

  }

  onSelectionChange(type: string) {

    if (type === 'dynamicIp') {
      $("#dnsFqnDiv").show(300);
      this.publicIpForm.controls["dnsFqdn"].setValidators([Validators.required]);
      this.publicIpForm.controls["dnsFqdn"].updateValueAndValidity();
    } else {
      $("#dnsFqnDiv").hide(400);
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
    //this.publicIpForm.removeControl(cname);    
  }

  ipSplit1: String[];
  ipSplit(str: String) {
    this.ipSplit1 = str.toString().split(',');
    return this.ipSplit1[0] + '.' + this.ipSplit1[1] + '.' + this.ipSplit1[2] + '.' + this.ipSplit1[3] + '-' + this.ipSplit1[4];
  }

}
