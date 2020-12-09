const MATH_JAX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML';

export class MathJaxService {
  private loading:boolean = false;
  private selectors:Array<string> = [];

  constructor() {
    this.renderEquation = this.renderEquation.bind(this);
    this.loadMathJax = this.loadMathJax.bind(this);
    this.onMathJaxLoaded = this.onMathJaxLoaded.bind(this);
  }

  renderEquation(selector:string) {
    const mathJax:any = (<any>window).MathJax;

    if (mathJax) {
      mathJax.Hub.Queue(['Typeset', mathJax.Hub, document.querySelector(selector)]);
    } else if (!this.loading) {
      this.selectors.push(selector);
      this.loadMathJax();
    }
  }

  loadMathJax() {
    this.loading = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = MATH_JAX_SRC;
    script.onload = this.onMathJaxLoaded;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  onMathJaxLoaded() {
    this.loading = false;

    this.selectors.forEach(selector => this.renderEquation(selector));
    this.selectors = [];
  }
}