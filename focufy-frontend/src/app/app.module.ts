import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ConfirmRegistrationComponent } from './components/confirm-registration/confirm-registration.component';
import { ModalModule } from './modules/modal.module';
import { ServiceUnavailableComponent } from './components/service-unavailable/service-unavailable.component';
import { LoaderComponent } from './components/loader/loader.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    FooterComponent,
    ProfileComponent,
    ConfirmRegistrationComponent,
    ServiceUnavailableComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    NgbModule, AppRoutingRoutingModule, HttpClientModule, ModalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
