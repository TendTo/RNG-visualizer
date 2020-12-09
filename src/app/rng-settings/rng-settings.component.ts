import { Component } from '@angular/core';

import { RngdataService } from '../rngdata.service';

@Component({
  selector: 'app-rng-settings',
  templateUrl: './rng-settings.component.html',
  styleUrls: ['./rng-settings.component.css']
})
export class RngSettingsComponent {

  constructor(public rngData: RngdataService) {
  }

  setTimeSeed() {
    let dateTime = new Date()
    this.rngData.seed = dateTime.getTime()
  }

  selectChangeGenerator(element: HTMLInputElement) {
    this.rngData.rngGenerator = element.value;
  }

  selectChangeRandom(element: HTMLInputElement){
    this.rngData.random = element.value;
  }
}
