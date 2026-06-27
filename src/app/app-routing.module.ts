import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

import { CanvasComponent } from './canvas/canvas.component';
import { FaultDetectionComponent } from './fault-detection/fault-detection.component';
import { ResultPageComponent } from './result-page/result-page.component';

import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

import { AdminResultSearchComponent } from './admin-result-search/admin-result-search.component';
import { AdminResultDetailsComponent } from './admin-result-details/admin-result-details.component';
import { AdminMasterVerifyComponent } from './admin-master-verify/admin-master-verify.component';
import { MasterGuard } from './master.guard';
import { AdminLandingComponent } from './admin-landing/admin-landing.component';
import { TpcComponent } from './tpc/tpc.component';
const routes: Routes = [

  // -------------------------
  // PUBLIC ROUTES
  // -------------------------
  { path: '', component: LandingComponent },
    { path: 'admin', component: AdminLandingComponent },

  { path: 'login', component: LoginComponent },
  { path: 'add-user', component: AddUserComponent, canActivate: [MasterGuard] },

  // -------------------------
  // ADMIN AUTH
  // -------------------------
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'add-admin', component: AddAdminComponent, canActivate: [MasterGuard] },
  { path: 'admin-verify', component: AdminMasterVerifyComponent },

  // -------------------------
  // USER AREA (Protected)
  // -------------------------
  { path: 'canvas', component: CanvasComponent, canActivate: [AuthGuard] },

  // -------------------------
  // ADMIN AREA (Protected)
  // -------------------------
  { path: 'fault-detection', component: FaultDetectionComponent, canActivate: [AdminGuard] },

  // NEW: Admin Search Page
{ path: 'admin-result-details/:id', component: AdminResultDetailsComponent, canActivate : [AdminGuard] },
{ path: 'admin-result-details/session/:sessionId', component: AdminResultDetailsComponent , canActivate: [AdminGuard] },


  // NEW: Admin Result Detail Page
  { 
    path: 'admin-result-search', 
    component: AdminResultSearchComponent, 
    canActivate: [AdminGuard] 
  },

  // -------------------------
  // USER RESULT PAGE
  // -------------------------
  { path: 'result', component: ResultPageComponent },
   { path: 'tpc-dashboard', component: TpcComponent },

  // existing routes
  { path: 'dashboard', component: CanvasComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
