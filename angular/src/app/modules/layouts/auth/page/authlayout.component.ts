import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/core/services/config.service';

@Component({
  selector: 'app-authlayout',
  templateUrl: './authlayout.component.html',
  styleUrls: ['./authlayout.component.sass']
})
export class AuthLayoutComponent implements OnInit {
  private sidebarVisible: boolean;
  private toggleButton: any;
  hostName:string;

  constructor(private config: ConfigService ) { 
    this.hostName = this.config.host.brand;

  }

  ngOnInit() {
    document.body.style.backgroundColor = "white"
  }

  language(lang: string) {
    this.config.setTranslationLanguage(lang);
  }

  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    // const sidebar = document.getElementsByClassName('navbar-collapse')[0];
    // if (this.sidebarVisible === false) {
    //   setTimeout(function () {
    //     toggleButton.classList.add('toggled');
    //   }, 500);
    //   body.classList.add('nav-open');
    //   this.sidebarVisible = true;
    // } else {
    //   this.toggleButton.classList.remove('toggled');
    //   this.sidebarVisible = false;
    //   body.classList.remove('nav-open');
    // }
  }

}
