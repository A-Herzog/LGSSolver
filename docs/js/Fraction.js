/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export {Fraction};


/**
 * Fraction consisting of integer numerator and denominator.
 */
class Fraction {
  #numerator;
  #denominator;

  /**
   * Constructor
   * @param {Number} numerator Numerator of the fraction (has to be an integer)
   * @param {Number} denominator Denominator of the fraction (has to be an integer)
   */
  constructor(numerator, denominator) {
    numerator=Math.round(numerator);
    denominator=Math.round(denominator);
    if (denominator<0) {
      numerator=-numerator;
      denominator=-denominator;
    }
    if (numerator==0) denominator=1;

    this.#numerator=numerator;
    this.#denominator=denominator;

    this.#normalize();

    Object.freeze(this);
  }

  #normalize() {
    const minus=(this.#numerator<0);
    this.#numerator=Math.abs(this.#numerator);

    const factors1=factorize(this.#numerator);
    const factors2=factorize(this.#denominator);

    const f1=new Set([...factors1.keys()]);
    const f2=new Set([...factors2.keys()]);
    let div=1;
    for (let factor of f1.union(f2)) {
      const count1=factors1.get(factor);
      const count2=factors2.get(factor);
      if (typeof(count1)=='undefined' || typeof(count2)=='undefined') continue;
      div*=(factor**Math.min(count1,count2));
    }

    this.#numerator/=div;
    this.#denominator/=div;
    if (minus) this.#numerator=-this.#numerator;
  }

  /**
   * Numerator
   */
  get numerator() {
    return this.#numerator;
  }

  /**
   * Denominator
   */
  get denominator() {
    return this.#denominator;
  }

  /**
   * Decimal value
   */
  get number() {
    return this.#numerator/this.#denominator;
  }

  /**
   * Generates a fraction from a decimal number.
   * @param {Number} number Input number (or Fraction object)
   * @returns Fraction
   */
  static fromNumber(number) {
    if (number instanceof Fraction) return new Fraction(number.numerator,number.denominator);

    let denominator=1;
    while (number%1!=0) {
      number*=10;
      denominator*=10;
      if (number>100_000_000) break;
    }

    return new Fraction(number,denominator);
  }

  /**
   * Compares the fraction with a number or a Fraction object.
   * @param {any} number Number or fraction to compare with
   * @returns Returns true if the number and the fraction are the same value
   */
  is(numberOrFraction) {
    if (numberOrFraction==null) return false;
    if (numberOrFraction instanceof Fraction) {
      return this.#numerator==numberOrFraction.numerator && this.#denominator==numberOrFraction.denominator;
    }
    return this.number==numberOrFraction;
  }

  /**
   * Absolute value
   */
  get abs() {
    return new Fraction(Math.abs(this.#numerator),Math.abs(this.#denominator));
  }

  /**
   * Inverse value (i.e. 1/x)
   */
  get inv() {
    return new Fraction(this.#denominator,this.#numerator);
  }

  /**
   * Inverts the sign
   */
  get minus() {
    return new Fraction(-this.#numerator,this.#denominator);
  }

  /**
   * Added a second fraction to this one.
   * @param {Fraction} secondFraction Second fraction
   * @returns Result fraction
   */
  add(secondFraction) {
    const n1=this.#numerator;
    const n2=secondFraction.numerator;
    const d1=this.#denominator;
    const d2=secondFraction.denominator;

    return new Fraction(n1*d2+n2*d1,d1*d2);
  }

  /**
   * Subtracts a second fraction from this one.
   * @param {Fraction} secondFraction Second fraction
   * @returns Result fraction
   */
  sub(secondFraction) {
    const n1=this.#numerator;
    const n2=secondFraction.numerator;
    const d1=this.#denominator;
    const d2=secondFraction.denominator;

    return new Fraction(n1*d2-n2*d1,d1*d2);
  }

  /**
   * Multiplies a second fraction to this one.
   * @param {Fraction} secondFraction Second fraction
   * @returns Result fraction
   */
  mul(secondFraction) {
    const n1=this.#numerator;
    const n2=secondFraction.numerator;
    const d1=this.#denominator;
    const d2=secondFraction.denominator;

    return new Fraction(n1*n2,d1*d2);
  }

  /**
   * Divides this fraction by a second one.
   * @param {Fraction} secondFraction Second fraction
   * @returns Result fraction
   */
  div(secondFraction) {
    const n1=this.#numerator;
    const n2=secondFraction.numerator;
    const d1=this.#denominator;
    const d2=secondFraction.denominator;

    return new Fraction(n1*d2,d1*n2);
  }

  toString() {
    if (this.#denominator==1) this.#numerator.toString();
    return this.#numerator.toString()+"/"+this.#denominator.toString();
  }

  /**
   * Returns the fraction as a LaTeX string.
   * @returns Fraction as LaTeX string (without $...$)
   */
  toLaTeX() {
    if (this.#denominator==1) this.#numerator.toString();
    if (this.#numerator<0) {
      return "-\\frac{"+(-this.#numerator).toString()+"}{"+this.#denominator.toString()+"}";
    } else {
      return "\\frac{"+this.#numerator.toString()+"}{"+this.#denominator.toString()+"}";
    }
  }
}

/**
 * List of small prime numbers (&le;1000) for faster factorization.
 * @see factorize(number)
 */
const smallPrimes=[
  2,   3,   5,   7,  11,  13,  17,  19,  23,  29,
  31,  37,  41,  43,  47,  53,  59,  61,  67,  71,
  73,  79,  83,  89,  97, 101, 103, 107, 109, 113,
 127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
 233, 239, 241, 251, 257, 263, 269, 271, 277, 281,
 283, 293, 307, 311, 313, 317, 331, 337, 347, 349,
 353, 359, 367, 373, 379, 383, 389, 397, 401, 409,
 419, 421, 431, 433, 439, 443, 449, 457, 461, 463,
 467, 479, 487, 491, 499, 503, 509, 521, 523, 541,
 547, 557, 563, 569, 571, 577, 587, 593, 599, 601,
 607, 613, 617, 619, 631, 641, 643, 647, 653, 659,
 661, 673, 677, 683, 691, 701, 709, 719, 727, 733,
 739, 743, 751, 757, 761, 769, 773, 787, 797, 809,
 811, 821, 823, 827, 829, 839, 853, 857, 859, 863,
 877, 881, 883, 887, 907, 911, 919, 929, 937, 941,
 947, 953, 967, 971, 977, 983, 991, 997
];

/**
 * Factorizes a positive integer.
 * @param {Number} number Positive integer to be factorized
 * @returns Map containing the factors as keys and the multiplicity as their values
 */
function factorize(number) {
  const map=new Map();

  while (number>1) {
    let factor=null;
    for (let test of smallPrimes) if (number%test==0) {factor=test; break;}
    if (factor==null) for (let test=1009;test<Math.floor(Math.sqrt(number));test+=2) if (number%test==0) {factor=test; break;}
    if (factor==null) {
      let count=map.get(number);
      map.set(number,(typeof(count)=='undefined')?1:(count+1));
      number=1;
    } else {
      let count=map.get(factor);
      map.set(factor,(typeof(count)=='undefined')?1:(count+1));
      number/=factor;
    }
  }

  return map;
}
