import TheoryList from '../assets/theory.json'

export interface TheoryCard {
  title: string;
  lines: string[];
  code?: string[];
}

interface Desc {
  title: string;
  dir: string[];
  rei: string[];
  mix: string[];
}

export interface DescCard {
  const: Desc;
  bis: Desc;
  lin: Desc;
}

export class TheoryDataService {
  private _theories: TheoryCard[];
  private _desc: DescCard;

  constructor() {
    this._theories = TheoryList.list;
    this._desc = TheoryList.desc;
  }

  get theories(): TheoryCard[] {
    return this._theories;
  }

  get desc(): DescCard{
    return this._desc;
  }
}
