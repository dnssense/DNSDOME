import {Injectable, Injector} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class ComponentService {

  public authService: AuthenticationService;

  constructor(public modalService: BsModalService, private injector: Injector) {
    setTimeout(() => {
      this.authService = this.injector.get(AuthenticationService);
    });

  }


  public loginModalRef: BsModalRef;


  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };


  public openLoginScreen() {
    /*const cf = componentFactoryResolver.resolveComponentFactory(LoginModalComponent);
     const injector = ReflectiveInjector.fromResolvedProviders([], viewContainer.parentInjector);
   let componentRef:ComponentRef<LoginModalComponent> = viewContainer.createComponent(cf, 0, injector, []);


   componentRef.instance.openLoginModalDialog();
   */

    this.authService.checkSessionIsValid();

    /*

     if (this.modalService.getModalsCount()==0){
       this.loginModalRef=this.modalService.show(LoginModalComponent, this.config);
     }

 */

  }


  public closeScreen() {
    this.modalService.hide(1);
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('modal-open');   //remove the class

  }


}
