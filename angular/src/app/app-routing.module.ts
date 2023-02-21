import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/layouts/auth/authlayout.module').then(m => m.AuthLayoutModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/layouts/admin/adminlayout.module').then(m => m.AdminLayoutModule)
  },
  { path: 'notfound', loadChildren: () => import('./modules/pagenotfound/pagenotfound.module').then(m => m.PagenotfoundModule)},
  { path: '**', pathMatch: 'full', redirectTo: '/notfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
