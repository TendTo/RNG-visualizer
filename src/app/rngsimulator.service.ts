class RngJava {
  private readonly p2_16 = 0x0000000010000;
  private readonly p2_27 = 0x0000008000000;
  private readonly p2_32 = 0x0000100000000;
  private readonly p2_53 = Math.pow(2, 53);
  private readonly ADD = 0xB;
  private readonly MASK = 0xffff;
  private readonly MULT = [0xe66d, 0xdeec, 0x0005]

  private seed = [0, 0, 0]

  private _desc = `
    \\( x_{i+1} = (1140671485x_i + 12820163) mod 2^{24} \\)
  `

  constructor(seed: number = 1) {
    this.initSeed(seed);
  }

  private next(shift: number) {

    let carry = this.ADD;

    let r0 = (this.seed[0] * this.MULT[0]) + carry;
    carry = r0 >>> 16;
    r0 &= this.MASK;

    let r1 = (this.seed[1] * this.MULT[0] + this.seed[0] * this.MULT[1]) + carry;
    carry = r1 >>> 16;
    r1 &= this.MASK;

    let r2 = (this.seed[2] * this.MULT[0] + this.seed[1] * this.MULT[1] + this.seed[0] * this.MULT[2]) + carry;
    r2 &= this.MASK;

    this.seed = [r0, r1, r2];

    return (this.seed[2] * this.p2_16 + this.seed[1]) >>> shift;
  }

  private initSeed(seed: number) {
    this.seed[0] = (seed & this.MASK) ^ this.MULT[0];
    this.seed[1] = ((seed / this.p2_16) & this.MASK) ^ this.MULT[1];
    this.seed[2] = ((seed / this.p2_32) & this.MASK) ^ this.MULT[2];
  }

  get desc(): string {
    return this._desc;
  }

  get seedNeeded(): boolean {
    return true;
  }

  setSeed(seed: number) {
    this.initSeed(seed)
  }

  random(): number {
    return (this.next(6) * this.p2_27 + this.next(5)) / this.p2_53;
  }
}

class RngTs {
  private _desc = `
  Anything goes
  `
  constructor() {
  }

  get seedNeeded(): boolean {
    return false;
  }

  setSeed(seed: number) {
  }

  get desc(): string {
    return this._desc;
  }

  random(): number {
    return Math.random();
  }
}

export interface RngGenerator {
  readonly desc: string;
  readonly seedNeeded: boolean;
  setSeed(seed: Number): void;
  random(): number;
}

export class RNGSimulatorService {
  private _rngJava = new RngJava()
  private _rngTs = new RngTs()

  const = (x: number) => { return x; }
  distConst = (x: number) => { return 1; }
  ripConst = (x: number) => { return x; }
  mixConst = (x: number) => { return 1; }

  lin = (x: number) => { return Math.cbrt(x); }
  distLin = (x: number) => { return 3 * Math.pow(x, 2); }
  ripLin = (x: number) => { return Math.pow(x, 3); }
  mixLin = (x: number) => { return 3 * x; }

  constructor() { }
  get rngJava() { return this._rngJava; }
  get rngTs() { return this._rngTs; }
}