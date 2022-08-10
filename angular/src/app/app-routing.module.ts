import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagenotfoundRoutingModule } from './modules/pagenotfound/pagenotfound-routing.module';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/layouts/auth/authlayout.module').then(m => m.AuthLayoutModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/layouts/admin/adminlayout.module').then(m => m.AdminLayoutModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
