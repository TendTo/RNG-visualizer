import { Component } from '@angular/core';
import { RngdataService } from '../rngdata.service';

@Component({
  selector: 'app-rng-plot',
  templateUrl: './rng-plot.component.html'
})
export class RngPlotComponent {

  constructor(public rngData: RngdataService) { };

}
