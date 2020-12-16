import { Injectable } from '@angular/core'
import { FunctionGroup, RngGenerator, RNGSimulatorService } from './rngsimulator.service'

import * as chi from 'chi-squared';

@Injectable()
export class RngdataService {
  readonly maxSeed = 10000000000000;
  readonly maxRep = 100000;
  readonly maxN = 100;

  public showNumbers = true;
  public showChi = true;

  public seed = 1;
  public rep = 100;
  public n = 10;
  public functionCoefficient = 1;
  private _random = this.randomDir;
  private _functionGroup: FunctionGroup;
  private _rngGenerator: RngGenerator;
  private _randomNumber: number | undefined;
  private _randomNumbers: number[];
  private _chi = { value: -1, df: -1, p_value: -1 };
  private _rngResult = { acc: -1, ref: -1, rat: -1 };

  private _graphNumbers = {
    data: [
      { x: undefined, y: undefined, type: 'scatter', name: "Valori accettati", mode: "markers" },
      { x: undefined, y: undefined, type: 'scatter', name: "Valori rifiutati", mode: "markers" }
    ],
    layout: { width: 530, height: 470, margin: { l: 40, r: 60, t: 70, b: 40 }, title: 'Numeri casuali generati' }
  };

  private _graphChi = {
    data: [
      { x: undefined, y: undefined, type: 'bar', name: "Distribuzione ideale" },
      { x: undefined, y: undefined, type: 'lines+markers', mode: "lines", name: "Ripartizione ideale" },
      { x: undefined, y: undefined, type: 'bar', name: "Distribuzione" },
      { x: undefined, y: undefined, type: 'lines+markers', mode: "lines", name: "Ripartizione" }
    ],
    layout: { width: 530, height: 470, margin: { l: 40, r: 60, t: 70, b: 40 }, title: 'Distribuzione dei numeri casuali (normalizzata)' }
  };

  constructor(private _rngSimulator: RNGSimulatorService) {
    this._rngGenerator = _rngSimulator.rngJS;
    this.function = 'const'
  }

  private validateInputs() {
    if (this.seed === undefined || this.seed < 1)
      this.seed = 1;
    else if (this.seed > this.maxSeed)
      this.seed = this.maxSeed;

    if (this.n === undefined || this.n < 1)
      this.n = 1;
    else if (this.n > this.maxN)
      this.n = this.maxN;

    if (this.rep === undefined || this.rep < 1)
      this.rep = 1;
    else if (this.rep > this.maxRep)
      this.rep = this.maxRep;

  }

  get seedNeeded(): boolean {
    return this._rngGenerator.seedNeeded;
  }

  get randomNumber(): number | undefined {
    return this._randomNumber;
  }

  get graphNumbers() {
    return this._graphNumbers;
  }

  get graphChi() {
    return this._graphChi;
  }

  get chiValue(): number {
    return this._chi.value;
  }

  get acc(): number {
    return this._rngResult.acc;
  }

  get ref(): number {
    return this._rngResult.ref;
  }

  get rat(): number {
    return this._rngResult.rat;
  }

  get df(): number {
    return this._chi.df;
  }

  get p_value(): string {
    if (this._chi.p_value == -1)
      return "Gradi di libertà insufficienti";
    return this._chi.p_value.toPrecision(3);
  }

  set function(newFunction: string) {
    this._functionGroup = this._rngSimulator.getFunctionGroup(newFunction);
  }

  get function(): string {
    return this._functionGroup.name;
  }

  set random(newRandom: string) {
    switch (newRandom) {
      case "dir":
        this._random = this.randomDir;
        break;
      case "rei":
        this._random = this.randomRei;
        break;
      case "mix":
        this._random = this.randomMix;
        break;
      default:
        break;
    }
  }

  get random(): string {
    switch (this._random) {
      case this.randomDir:
        return 'dir';
      case this.randomRei:
        return 'rei';
      case this.randomMix:
        return 'mix';
      default:
        break;
    }
  }

  set rngGenerator(newGenerator: string) {
    switch (newGenerator) {
      case "javascript":
        this._rngGenerator = this._rngSimulator.rngJS;
        break;
      case "java":
        this._rngGenerator = this._rngSimulator.rngJava;
        break;
      default:
        break;
    }
  }

  get rngGenerator(): string {
    switch (this._rngGenerator) {
      case this._rngSimulator.rngJS:
        return 'javascript';
      case this._rngSimulator.rngJava:
        return 'java';
      default:
        break;
    }
  }

  getRandomNumbers() {
    this._random();
  }

  startChi() {
    const interval = 1 / this.n;
    let distribution = new Array<number>(this.n).fill(0);
    let cumulative = new Array<number>(this.n);
    let xAxis = new Array<number>(this.n);
    let oldResults = this._randomNumbers;
    let nOldResults = this._randomNumbers.length;
    this._chi.value = 0;
    this._chi.df = this.n - 1;

    for (let i = 0; i < this.n; i++) {
      xAxis[i] = interval * (i + 1);
    }

    let idealDist = xAxis
      .map(e => this._functionGroup.distribution(this._functionGroup.minX + e * this._functionGroup.interval));
    let tot = idealDist.reduce((s, e) => s + e);
    idealDist = idealDist.map(e => e / tot);

    for (let i = 0; i < nOldResults; i++) {
      let group = Math.floor(oldResults[i] * this.n);
      distribution[group]++;
    }

    cumulative[0] = distribution[0];
    for (let i = 1; i <= this.n; i++)
      cumulative[i] = distribution[i] + cumulative[i - 1];

    for (let i = 0; i < this.n; i++) {
      this._chi.value += nOldResults * Math.pow(distribution[i] / nOldResults - idealDist[i], 2) / (idealDist[i]);
    }

    try {
      this._chi.p_value = 1 - chi.cdf(this.chiValue, this._chi.df);
    } catch (error) {
      this._chi.p_value = -1;
    }


    this._graphChi.data[0].x = xAxis;
    this._graphChi.data[0].y = idealDist;

    this._graphChi.data[1].x = xAxis;
    this._graphChi.data[1].y = xAxis.map(e => this._functionGroup.cumulativeDistribution(this._functionGroup.minX + e * this._functionGroup.interval));

    this._graphChi.data[2].x = xAxis;
    this._graphChi.data[2].y = distribution.map(e => e / nOldResults);

    this._graphChi.data[3].x = xAxis;
    this._graphChi.data[3].y = cumulative.map(e => e / nOldResults);
  }

  private randomDir() {
    this.validateInputs();
    this._rngGenerator.setSeed(this.seed);

    let xAccepted: number[] = [];
    let yAccepted: number[] = [];

    for (let i = 0; i < this.rep; i++) {
      let xResult = this._functionGroup.direct(this._rngGenerator.random());
      let yResult = this._rngGenerator.random() * this._functionGroup.distribution(xResult);
      xAccepted.push(xResult);
      yAccepted.push(yResult);
    }

    this._chi.value = -1;
    this._randomNumbers = xAccepted.map(e => - this._functionGroup.minX + e / this._functionGroup.interval);

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = undefined;
    this._graphNumbers.data[1].y = undefined;

    this._rngResult = { acc: xAccepted.length, ref: 0, rat: 1 };
  }

  private randomRei() {
    this.validateInputs();
    this._rngGenerator.setSeed(this.seed);

    this._randomNumbers = [];
    let xRefused: number[] = [];
    let yRefused: number[] = [];
    let xAccepted: number[] = [];
    let yAccepted: number[] = [];

    for (let i = 0; i < this.rep; i++) {
      let x = this._rngGenerator.random();
      let xResult = this._functionGroup.minX + x * this._functionGroup.interval;
      let yResult = this._rngGenerator.random() * this._functionGroup.maxY;
      if (yResult < this._functionGroup.distribution(xResult)) {
        xAccepted.push(xResult);
        yAccepted.push(yResult);
        this._randomNumbers.push(x);
      }
      else {
        xRefused.push(xResult);
        yRefused.push(yResult);
      }
    }

    this._chi.value = -1;

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = xRefused;
    this._graphNumbers.data[1].y = yRefused;

    this._rngResult = { acc: xAccepted.length, ref: xRefused.length, rat: xAccepted.length / this.rep };
  }

  private randomMix() {
    this.validateInputs();
    this._rngGenerator.setSeed(this.seed);

    this._randomNumbers = [];
    let xRefused: number[] = [];
    let yRefused: number[] = [];
    let xAccepted: number[] = [];
    let yAccepted: number[] = [];

    for (let i = 0; i < this.rep; i++) {
      let x = this._functionGroup.mixX(this._rngGenerator.random());
      let xResult = this._functionGroup.minX + x * this._functionGroup.interval;
      let yResult = this._functionGroup.mixY(this._rngGenerator.random(), xResult);
      if (yResult < this._functionGroup.distribution(xResult)) {
        xAccepted.push(xResult);
        yAccepted.push(yResult);
        this._randomNumbers.push(x);
      }
      else {
        xRefused.push(xResult);
        yRefused.push(yResult);
      }
    }

    this._chi.value = -1;
    // this._randomNumbers = xAccepted;

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = xRefused;
    this._graphNumbers.data[1].y = yRefused;

    this._rngResult = { acc: xAccepted.length, ref: xRefused.length, rat: xAccepted.length / this.rep };
  }
}
