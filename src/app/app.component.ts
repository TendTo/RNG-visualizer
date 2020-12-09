import { Component } from '@angular/core';

import { MathJaxService } from './math-jax.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sitePage = "home"

  constructor(private mathJaxService: MathJaxService) {

  };

  changePage(newPage: string){
    this.sitePage = newPage;
    this.mathJaxService.renderEquation('#equation');
  }
}
