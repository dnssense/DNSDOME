import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';


declare const $: any;
@Component({
  selector: 'app-notification',
  templateUrl: 'notification.component.html',
  styleUrls: ['notification.component.css']
})
export class NotificationComponent implements OnInit {

  constructor(private notificationService:NotificationService) { 
    this.notificationService.getMessage().subscribe(x=>{  
      if(x && x.type && x.text)
      this.showNotification('top','right',x.type,x.text);
    });
  }

  ngOnInit() {
  }
  showNotification(from: any, align: any,which:string,msg:string) {
    const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];
    
    const color = Math.floor((Math.random() * 6) + 1);

    $.notify({
        icon: 'notifications',
        message: msg
    }, {
        type: which,
        timer: 3000,
        placement: {
            from: from,
            align: align
        },
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
}

}
