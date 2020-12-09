import TheoryList from '../assets/theory.json'

export interface TheoryCard {
  title: string;
  lines: string[];
  code?: string[];
}

export class TheoryDataService {
  private _theories: TheoryCard[];

  constructor() {
    this._theories = TheoryList.list;    
  }

  get theories(): TheoryCard[] {
    return this._theories;
  }
}
