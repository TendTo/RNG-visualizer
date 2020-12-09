import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RngPlotComponent } from './rng-plot/rng-plot.component';
import { ChiSettingsComponent } from './chi-settings/chi-settings.component';
import { RngSettingsComponent } from './rng-settings/rng-settings.component';

import { RNGSimulatorService } from './rngsimulator.service';
import { RngdataService } from './rngdata.service';
import { MathJaxService } from './math-jax.service';
import { TheoryDataService } from './theory-data.service';

import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { TheoryComponent } from './theory/theory.component';
import { ChiPlotComponent } from './chi-plot/chi-plot.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    RngPlotComponent,
    ChiSettingsComponent,
    RngSettingsComponent,
    TheoryComponent,
    ChiPlotComponent,
  ],
  imports: [
    BrowserModule,
    PlotlyModule,
    FormsModule
  ],
  providers: [
    RNGSimulatorService,
    RngdataService,
    MathJaxService,
    TheoryDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
