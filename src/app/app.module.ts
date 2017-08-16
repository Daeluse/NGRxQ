import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GoalAnalyticsComponent } from './goal-analytics/goal-analytics.component';

import { QlikService } from './shared';

import { routing } from './app.routing';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    MaterialModule,
    CdkTableModule,
    routing,
    NgxChartsModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    GoalAnalyticsComponent,
  ],
  providers: [
    QlikService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    console.log('HMR store', store);
  }
  hmrOnDestroy(store) {
    let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
