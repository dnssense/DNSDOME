import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ConfigHost, ConfigService } from 'src/app/core/services/config.service';


@Component({
  selector: 'app-publichelp-cmp',
  templateUrl: 'publichelp.component.html'
})
export class PublicHelpComponent implements OnInit, OnDestroy {

  test: Date = new Date();
  private toggleButton: any;
  private sidebarVisible: boolean;

  host: ConfigHost;
  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

  constructor(private element: ElementRef, private configService: ConfigService) {
    this.sidebarVisible = false;
    this.host = this.configService.host;
  }

  ngOnInit() {

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(function () {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  sidebarToggle() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      setTimeout(function () {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
    body.classList.remove('off-canvas-sidebar');
  }


  downloadFile() {
    window.open('http://docs.netcyte.co/Secure_DNS_Setup_Guide.pdf', "_blank");

  }


}
