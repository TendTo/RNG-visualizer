import { Component } from '@angular/core';

import { MathJaxService } from '../math-jax.service'
import { RngdataService } from '../rngdata.service';

@Component({
  selector: 'app-rng-settings',
  templateUrl: './rng-settings.component.html',
  styleUrls: ['./rng-settings.component.css']
})
export class RngSettingsComponent {

  constructor(public rngData: RngdataService, public mathjax: MathJaxService) {
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
    this.render();
  }

  clickGenerateRandomNumbers(){
    this.rngData.getRandomNumbers();
    this.render();
  }

  render(){
    setTimeout(this.mathjax.renderEquation, 100, '#equation');
  }
}
