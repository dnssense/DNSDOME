import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, Router } from '@angular/router';
import { PagenotfoundComponent } from './page/pagenotfound/pagenotfound.component';


const pagenotfoundRoutes: Routes = [
  { path: '',  component: PagenotfoundComponent },

];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(pagenotfoundRoutes)
  ],
  exports:[
    RouterModule
  ]
})
export class PagenotfoundRoutingModule { }
