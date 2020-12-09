class RngJava {
  private readonly p2_16 = 0x0000000010000;
  private readonly p2_27 = 0x0000008000000;
  private readonly p2_32 = 0x0000100000000;
  private readonly p2_53 = Math.pow(2, 53);
  private readonly ADD = 0xB;
  private readonly MASK = 0xffff;
  private readonly MULT = [0xe66d, 0xdeec, 0x0005]

  private seed = [0, 0, 0]

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

class RngJS {
  private readonly p2_16 = 0x0000000010000;
  private readonly p2_27 = 0x0000008000000;
  private readonly p2_32 = 0x0000100000000;
  private readonly MASK = 0xffff;
  private readonly MULT = [0xe66d, 0xdeec, 0x0005]

  private _seed = { a: 0, b: 0, c: 0, d: 0 };

  constructor() {
  }

  get seedNeeded(): boolean {
    return true;
  }

  // private xorshift128_init(seed: number) {
  //   this._seed.seed = seed;
  //   this._status = { a: 0, b: 0, c: 0, d: 0 };

  //   let tmp = this.splitmix64();
  //   this._status.a = tmp;
  //   this._status.b = (tmp >> 32);

  //   tmp = this.splitmix64();
  //   this._status.c = tmp;
  //   this._status.d = (tmp >> 32);
  // }

  private initSeed(seed: number) {
    this._seed.a = (seed & this.MASK) ^ this.MULT[0];
    this._seed.b = ((seed / this.p2_16) & this.MASK) ^ this.MULT[1];
    this._seed.c = ((seed / this.p2_32) & this.MASK) ^ this.MULT[2];
    this._seed.d = (seed & this.MASK) ^ this.MULT[2];
  }

  setSeed(seed: number) {
    this.initSeed(seed);
  }

  random(): number {
    let a = this._seed.a, b = this._seed.b, c = this._seed.c, d = this._seed.d;
    this._seed.a = c; this._seed.b = d;

    var t = b << 9, r = a * 5; 
    r = (r << 7 | r >>> 25) * 9;
    c ^= a; d ^= b;
    b ^= c; a ^= d; c ^= t;
    d = d << 11 | d >>> 21;

    this._seed.c = r; this._seed.d = t;
    return (r >>> 0) / 4294967296;
  }
}

export interface RngGenerator {
  readonly seedNeeded: boolean;
  setSeed(seed: Number): void;
  random(): number;
}

export class RNGSimulatorService {
  private _rngJava = new RngJava()
  private _rngJS = new RngJS()

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
  get rngJS() { return this._rngJS; }
}