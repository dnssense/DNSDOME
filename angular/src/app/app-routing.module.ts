import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagenotfoundRoutingModule } from './modules/pagenotfound/pagenotfound-routing.module';


const routes: Routes = [
  {
    
      path: '',
      loadChildren: './modules/layouts/auth/authlayout.module#AuthLayoutModule'
  },
  {
    path:'admin',
    loadChildren:'./modules/layouts/admin/adminlayout.module#AdminLayoutModule'
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
