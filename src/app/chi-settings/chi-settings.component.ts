import { Component, OnInit } from '@angular/core';

import { RngdataService } from '../rngdata.service';
import { MathJaxService } from '../math-jax.service'

@Component({
  selector: 'app-chi-settings',
  templateUrl: './chi-settings.component.html',
  styleUrls: ['./chi-settings.component.css']
})
export class ChiSettingsComponent implements OnInit{

  constructor(public rngData: RngdataService, private mathJaxService: MathJaxService) { };
  
  ngOnInit(): void {
    this.mathJaxService.renderEquation('#equation');
  }

}
