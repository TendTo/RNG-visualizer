import { Component } from '@angular/core';

import { RngdataService } from '../rngdata.service';

@Component({
  selector: 'app-chi-plot',
  templateUrl: './chi-plot.component.html'
})
export class ChiPlotComponent {

  constructor(public rngData: RngdataService) { }


}
