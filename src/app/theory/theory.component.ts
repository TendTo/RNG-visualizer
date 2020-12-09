import { Component, OnInit } from '@angular/core';

import { MathJaxService } from '../math-jax.service'
import { TheoryCard, TheoryDataService } from '../theory-data.service'

@Component({
  selector: 'app-theory',
  templateUrl: './theory.component.html',
  styleUrls: ['./theory.component.css']
})
export class TheoryComponent implements OnInit {

  theoryList: TheoryCard[];

  constructor(private mathJaxService: MathJaxService, private theoryData: TheoryDataService) {
    this.theoryList = this.theoryData.theories;
  };

  ngOnInit() {
    this.mathJaxService.renderEquation('#equation');
  }
}
