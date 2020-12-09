import { Component, OnInit } from '@angular/core';

import { MathJaxService } from '../math-jax.service';
import { RngdataService } from '../rngdata.service';
import { DescCard, TheoryDataService } from '../theory-data.service'

@Component({
  selector: 'app-rng-desc',
  templateUrl: './rng-desc.component.html'
})
export class RngDescComponent implements OnInit {

  descCard: DescCard;

  constructor(private mathjax: MathJaxService, public rngData: RngdataService, theoryData: TheoryDataService) {
    this.descCard = theoryData.desc;
  }

  ngOnInit(): void {

  }
}
