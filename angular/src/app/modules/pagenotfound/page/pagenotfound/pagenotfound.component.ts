import { Component, OnInit } from '@angular/core';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.sass']
})
export class PagenotfoundComponent {

  host: ConfigHost;
  title?: string; 
  
  constructor(private configService: ConfigService) {
    this.host = configService.host;
    this.title = this.host.title;
    
  }
   
}
