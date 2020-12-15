import { Injectable } from '@angular/core'
import { RngGenerator, RNGSimulatorService } from './rngsimulator.service'

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
  private _function: Function;
  private _distFunction: Function;
  private _ripFunction: Function;
  private _mixFunction: Function;
  private _mixYFunction: Function;
  private _rngGenerator: RngGenerator;
  private _randomNumber: number | undefined;
  private _randomNumbers: number[];
  private _maxRandomValue = 1;
  private _chiValue = -1;
  private _df = -1;
  private _p_value = -1;
  private _acc = -1;
  private _ref = -1;
  private _rat = -1;

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
    return this._chiValue;
  }

  get acc(): number {
    return this._acc;
  }

  get ref(): number {
    return this._ref;
  }

  get rat(): number {
    return this._rat;
  }

  get df(): number {
    return this._df;
  }

  get p_value(): string {
    if (this._p_value == -1)
      return "Gradi di libertà insufficienti";
    return this._p_value.toPrecision(3);
  }

  set function(newFunction: string) {
    switch (newFunction) {
      case "const":
        this._function = this._rngSimulator.const;
        this._distFunction = this._rngSimulator.distConst;
        this._ripFunction = this._rngSimulator.ripConst;
        this._mixFunction = this._rngSimulator.mixConst;
        this._mixYFunction = this._rngSimulator.mixYConst;
        this._maxRandomValue = 1;
        break;
      case "lin":
        this._function = this._rngSimulator.lin;
        this._distFunction = this._rngSimulator.distLin;
        this._ripFunction = this._rngSimulator.ripLin;
        this._mixFunction = this._rngSimulator.mixLin;
        this._mixYFunction = this._rngSimulator.mixYLin;
        this._maxRandomValue = 3;
        break;
      case 'bis':
        this._function = this._rngSimulator.bis;
        this._distFunction = this._rngSimulator.distBis;
        this._ripFunction = this._rngSimulator.ripBis;
        this._mixFunction = this._rngSimulator.mixBis;
        this._mixYFunction = this._rngSimulator.mixYBis;
        this._maxRandomValue = 1;
      default:
        break;
    }
  }

  get function(): string {
    switch (this._function) {
      case this._rngSimulator.const:
        return 'const';
      case this._rngSimulator.lin:
        return 'lin'
      case this._rngSimulator.bis:
        return 'bis';
      default:
        break;
    }
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
    this._chiValue = 0;
    this._df = this.n - 1;

    for (let i = 0; i < this.n; i++) {
      xAxis[i] = interval * (i + 1);
    }

    let idealDist = xAxis.map(e => this._distFunction(e));
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
      this._chiValue += nOldResults * Math.pow(distribution[i] / nOldResults - idealDist[i], 2) / (idealDist[i]);
    }

    try {
      this._p_value = 1 - chi.cdf(this.chiValue, this._df);
    } catch (error) {
      this._p_value = -1;
    }
    

    this._graphChi.data[0].x = xAxis;
    this._graphChi.data[0].y = idealDist;

    this._graphChi.data[1].x = xAxis;
    this._graphChi.data[1].y = xAxis.map(e => this._ripFunction(e))

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
      let xResult = this._function(this._rngGenerator.random());
      let yResult = this._rngGenerator.random() * this._distFunction(xResult);
      xAccepted.push(xResult);
      yAccepted.push(yResult);
    }

    this._chiValue = -1;
    this._randomNumbers = xAccepted;

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = undefined;
    this._graphNumbers.data[1].y = undefined;

    this._acc = xAccepted.length;
    this._ref = 0;
    this._rat = 1;
  }

  private randomRei() {
    this.validateInputs();
    this._rngGenerator.setSeed(this.seed);

    let xRefused: number[] = [];
    let yRefused: number[] = [];
    let xAccepted: number[] = [];
    let yAccepted: number[] = [];

    for (let i = 0; i < this.rep; i++) {
      let xResult = this._rngGenerator.random();
      let yResult = this._rngGenerator.random() * this._maxRandomValue;
      if (yResult < this._distFunction(xResult)) {
        xAccepted.push(xResult);
        yAccepted.push(yResult);
      }
      else {
        xRefused.push(xResult);
        yRefused.push(yResult);
      }
    }

    this._chiValue = -1;
    this._randomNumbers = xAccepted;

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = xRefused;
    this._graphNumbers.data[1].y = yRefused;

    this._acc = xAccepted.length;
    this._ref = xRefused.length;
    this._rat = xAccepted.length / this.rep;
  }

  private randomMix() {
    this.validateInputs();
    this._rngGenerator.setSeed(this.seed);

    let xRefused: number[] = [];
    let yRefused: number[] = [];
    let xAccepted: number[] = [];
    let yAccepted: number[] = [];

    for (let i = 0; i < this.rep; i++) {
      let xResult = this._mixFunction(this._rngGenerator.random());
      let yResult = this._mixYFunction(this._rngGenerator.random(), xResult);
      if (yResult < this._distFunction(xResult)) {
        xAccepted.push(xResult);
        yAccepted.push(yResult);
      }
      else {
        xRefused.push(xResult);
        yRefused.push(yResult);
      }
    }

    this._chiValue = -1;
    this._randomNumbers = xAccepted;

    this._graphNumbers.data[0].x = xAccepted;
    this._graphNumbers.data[0].y = yAccepted;

    this._graphNumbers.data[1].x = xRefused;
    this._graphNumbers.data[1].y = yRefused;

    this._acc = xAccepted.length;
    this._ref = xRefused.length;
    this._rat = xAccepted.length / this.rep;
  }
}
