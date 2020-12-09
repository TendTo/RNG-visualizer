import { Component } from '@angular/core';

import { RngdataService } from '../rngdata.service';

@Component({
  selector: 'app-plot-desc',
  templateUrl: './plot-desc.component.html'
})
export class PlotDescComponent {

  constructor(public rngData: RngdataService) { }

}
