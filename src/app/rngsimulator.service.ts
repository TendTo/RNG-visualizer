class RngJava implements RngGenerator {
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

class RngJS implements RngGenerator {
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

class ConstFunction implements FunctionGroup {
  readonly name = "const";
  readonly minX = 0;
  readonly maxX = 1;
  readonly maxY = 1;
  get interval(): number{
    return this.maxX - this.minX;
  };
  readonly direct = (x: number) => { return x; };
  readonly distribution = (x: number) => { return 1; };
  readonly cumulativeDistribution = (x: number) => { return x; };
  readonly mixX = (x: number) => { return x; };
  readonly mixY = (y: number, x: number) => { return y; };
}

class BisFunction implements FunctionGroup {
  readonly name = "bis";
  readonly minX = 0;
  readonly maxX = Math.SQRT2;
  readonly maxY = Math.SQRT2;
  get interval(): number{
    return this.maxX - this.minX;
  };
  readonly direct = (x: number) => { return Math.sqrt(2 * x); };
  readonly distribution = (x: number) => { return x; };
  readonly cumulativeDistribution = (x: number) => { return 0.5 * Math.pow(x, 2); };
  readonly mixX = (x: number) => { return Math.sqrt(2 * x) / Math.SQRT2; };
  readonly mixY = (y: number, x: number) => { return y * x; };
}

class LinFunction implements FunctionGroup {
  readonly name = "lin";
  readonly minX = 0;
  readonly maxX = 1;
  readonly maxY = 3;
  get interval(): number{
    return this.maxX - this.minX;
  };
  readonly direct = (x: number) => { return Math.cbrt(x); };
  readonly distribution = (x: number) => { return 3 * Math.pow(x, 2); };
  readonly cumulativeDistribution = (x: number) => { return Math.pow(x, 3); };
  readonly mixX = (x: number) => { return Math.sqrt(2 * x) / Math.SQRT2; };
  readonly mixY = (y: number, x: number) => { return y * x * 3 };
}

class CosFunction implements FunctionGroup {
  readonly name = "cos";
  readonly minX = 0;
  readonly maxX = Math.PI / 2;
  readonly maxY = 1;
  get interval(): number{
    return this.maxX - this.minX;
  };
  readonly direct = (x: number) => { return Math.asin(x); };
  readonly distribution = (x: number) => { return Math.cos(x); };
  readonly cumulativeDistribution = (x: number) => { return Math.sin(x); };
  readonly mixX = (x: number) => { return x; };
  readonly mixY = (y: number, x: number) => { return y; };
}

export interface RngGenerator {
  readonly seedNeeded: boolean;
  setSeed(seed: Number): void;
  random(): number;
}

export interface FunctionGroup {
  readonly name: string;
  readonly minX: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly interval: number;
  readonly direct: (x: number) => number;
  readonly distribution: (x: number) => number;
  readonly cumulativeDistribution: (x: number) => number;
  readonly mixX: (x: number) => number;
  readonly mixY: (y: number, x: number) => number;
}

export class RNGSimulatorService {
  readonly rngJava = new RngJava();
  readonly rngJS = new RngJS();
  private readonly const = new ConstFunction();
  private readonly bis = new BisFunction();
  private readonly lin = new LinFunction();
  private readonly cos = new CosFunction();

  getFunctionGroup(name: string): FunctionGroup {
    return this[name];
  }
}