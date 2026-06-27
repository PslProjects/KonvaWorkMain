import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxKonvaModule } from 'ngx-konva';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CircuitSimulatorComponent } from './circuit-simulator/circuit-simulator.component';
import { CanvasComponent } from './canvas/canvas.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ResultPageComponent } from './result-page/result-page.component';
import { FaultDetectionComponent } from './fault-detection/fault-detection.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AdminResultSearchComponent } from './admin-result-search/admin-result-search.component';
import { AdminResultDetailsComponent } from './admin-result-details/admin-result-details.component';
import { AdminMasterVerifyComponent } from './admin-master-verify/admin-master-verify.component';
import { AdminLandingComponent } from './admin-landing/admin-landing.component';
import { TpcComponent } from './tpc/tpc.component';
@NgModule({
  declarations: [
    AppComponent,
    CircuitSimulatorComponent,
    CanvasComponent,
    LandingComponent,
    ResultPageComponent,
    FaultDetectionComponent,
    LoginComponent,
    AddUserComponent,
    AdminLoginComponent,
    AddAdminComponent,
    AdminResultSearchComponent,
    AdminResultDetailsComponent,
    AdminMasterVerifyComponent,
    AdminLandingComponent,
    TpcComponent
  ],
  imports: [
    BrowserModule,
    NgxKonvaModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule

  ],

  providers: [],
  bootstrap: [AppComponent],

})
export class AppModule { }
