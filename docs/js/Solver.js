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

export {checkLGS, calcSolution};

import {language} from "./Language.js";
import {Fraction} from "./Fraction.js";

function getValue(htmlElement) {
  const str=htmlElement.value.replaceAll(",",".");
  const index=str.indexOf("/");
  if (index>=0) {
    const str1=str.substring(0,index);
    const str2=str.substring(index+1);
    const num1=parseFloat(str1);
    const num2=parseFloat(str2);
    if (isNaN(num1) || isNaN(num2)) return null;
    if (num1%1!=0 || num2%1!=0) return null;
    return new Fraction(num1,num2);
  } else {
    const num=parseFloat(str);
    if (isNaN(num)) return null;
    return num;
  }
}

/**
 * Reads the values of M and b from the html input elements.
 * @param {Array} htmlM Matrix M in form of html input elements
 * @param {Array} htmlb Vector b in form of html input elements
 * @param {Boolean} forceFractions Always use fraction mode? (Defaults to false.)
 * @returns Returns in case of success a two element array containing M and b, otherwise a string with an error message
 */
function checkLGS(htmlM, htmlb, forceFractions=false) {
  let hasFractions=forceFractions;

  /* Build matrix M data */
  const M=[];
  for (let i=0;i<htmlM.length;i++) {
    const row=[];
    for (let j=0;j<htmlM[i].length;j++) {
        const num=getValue(htmlM[i][j]);
        if (num===null) return language.GUI.errorM;
        if (num instanceof Fraction) hasFractions=true;
        row.push(num);
    }
    M.push(row);
  }

  /* Build vector b data */
  const b=[];
  for (let i=0;i<htmlb.length;i++) {
    const num=getValue(htmlb[i]);
    if (num===null) return language.GUI.errorb;
    if (num instanceof Fraction) hasFractions=true;
    b.push(num);
  }

  /* If there is a fraction we have to make fractions from all cells */
  if (hasFractions) {
    for (let i=0;i<M.length;i++) for (let j=0;j<M[i].length;j++) M[i][j]=Fraction.fromNumber(M[i][j]);
    for (let i=0;i<b.length;i++) b[i]=Fraction.fromNumber(b[i]);
  }

  return [M,b];
}

/**
 * Number of digits to be shown in round.
 */
let roundDigits=3;

/**
 * Rounds a number to roundDigits digits and converts it in a local string.
 * @param {Number} f Number to be converted to a string
 * @returns Number as local string
 */
function round(f) {
  if (f instanceof Fraction) {
    if (f.denominator==1) return round(f.numerator);
    return round(f.numerator)+"/"+round(f.denominator);
  }

  let s;
  s=f.toLocaleString(undefined, {minimumFractionDigits: roundDigits, useGrouping: false});
  if (s.indexOf(".")>=0 || s.indexOf(",")>=0) {
    while (s[s.length-1]=="0") s=s.substring(0,s.length-1);
    if (s[s.length-1]=="." || s[s.length-1]==",") s=s.substring(0,s.length-1);
  }
  return (s=='-0')?"0":s;
}

/**
 * Rounds a number to roundDigits digits and converts it in a local string in LaTeX code.
 * @param {Number} f Number to be converted to a string
 * @param {Boolean} addMathMode Add $...$ around fractions (optional; defaults to true)
 * @returns Number as local string in LaTeX code
 */
function latex(f, addMathMode=true) {
  if (f instanceof Fraction) {
    if (f.denominator==1) return latex(f.numerator);
    if (addMathMode) return "$"+f.toLaTeX()+"$";
    return f.toLaTeX();
  }

  let s;
  s=f.toLocaleString(undefined, {minimumFractionDigits: roundDigits, useGrouping: false});
  if (s.indexOf(".")>=0 || s.indexOf(",")>=0) {
    while (s[s.length-1]=="0") s=s.substring(0,s.length-1);
    if (s[s.length-1]=="." || s[s.length-1]==",") s=s.substring(0,s.length-1);
  }
  s=(s=='-0')?"0":s;
  s=s.replaceAll(",","{,}");
  return s;
}

/**
 * Rounds all numbers in an object to the precision defined global.
 * @param {Object} obj Number, vector (Array) or matrix (Array of Arrays)
 * @returns Object with values rounded to the defined precision
 */
function roundToSetDigits(obj) {
  if (Array.isArray(obj)) return obj.map(record=>roundToSetDigits(record));
  if (typeof(obj)=='number') return Number(obj.toFixed(roundDigits));
  return obj;
}

/**
 * Generates HTML and LaTeX code showing a LGS.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @returns HTML and LaTeX code for Mx=b
 */
function showLGS(dataA, dataB) {
  /* HTML code */
  let resultHTML="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
  for (let i=0;i<dataA.length;i++) {
    const row=dataA[i];
    resultHTML+="<tr>";
    for (let j=0;j<row.length;j++) resultHTML+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+"\">"+round(row[j])+"</td>\n";
    resultHTML+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;\">"+round(dataB[i])+"</td>\n";
    resultHTML+="</tr>\n";
  }
  resultHTML+="</table>\n";

  /* LaTeX code */
  let resultLaTeX="\\begin{tabular}{|"+dataA[0].map(()=>"r").join("|")+"||r|}\n";
  resultLaTeX+="\\hline\n";
  for (let i=0;i<dataA.length;i++) {
    const row=[...dataA[i], dataB[i]];
    resultLaTeX+=row.map(cell=>latex(cell)).join("&")+"\\\\\n";
    resultLaTeX+="\\hline\n";
  }
  resultLaTeX+="\\end{tabular}\n\n";

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Generates HTML and LaTeX code showing a LGS and highlights a column and a row.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Number} rowNr Row to be highlighted (0-based)
 * @param {Number} colNr Column to be highlighted (0-based)
 * @returns HTML and LaTeX code for Mx=b
 */
function showLGSHighlightRow(dataA, dataB, rowNr, colNr) {
  /* HTML code */
  let resultHTML="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
  let c1, c2;
  if (document.documentElement.dataset.bsTheme=='dark') {
    c1="#151";
    c2="#511";
  } else {
    c1="#DFD";
    c2="#FCC";
  }

  for (let i=0;i<dataA.length;i++) {
    const row=dataA[i];
    const color=(rowNr==i)?(" background-color: "+c1+";"):"";
    resultHTML+="<tr>";
    for (let j=0;j<row.length;j++) {
      const color2=(color!="" && j==colNr)?(" background-color: "+c2+";"):color;
      resultHTML+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+color2+"\">"+round(row[j])+"</td>\n";
    }
    const color2=(color!="" && row.length==colNr)?(" background-color: "+c2+";"):color;
    resultHTML+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;"+color2+"\">"+round(dataB[i])+"</td>\n";
    resultHTML+="</tr>\n";
  }
  resultHTML+="</table>\n";

  /* LaTeX code */
  let resultLaTeX="\\begin{tabular}{|"+dataA[0].map(()=>"r").join("|")+"||r|}\n";
  resultLaTeX+="\\hline\n";
  for (let i=0;i<dataA.length;i++) {
    const row=[...dataA[i], dataB[i]];
    const rowColor=(rowNr==i)?"cellgreen":"";
    resultLaTeX+=row.map((cell,j)=>{
      const cellColor=(i==rowNr&& j==colNr)?"cellred":rowColor;
      const c=(cellColor=='')?'':("\\cellcolor{"+cellColor+"!75} ");
      return c+latex(cell);
    }).join("&")+"\\\\\n";
    resultLaTeX+="\\hline\n";
  }
  resultLaTeX+="\\end{tabular}\n\n";

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Generates HTML and LaTeX code showing a LGS and uses user-defined background colors.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Array} colorsHTML User defined colors for the HTML cells
 * @param {Array} colorsLaTeX User defined colors for the LaTeX cells
 * @returns HTML and LaTeX code for Mx=b
 */
function showLGSCustomHighlight(dataA, dataB, colorsHTML, colorsLaTeX) {
  /* HTML code */
  let resultHTML="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
  for (let i=0;i<dataA.length;i++) {
    const row=dataA[i];
    resultHTML+="<tr>";
    for (let j=0;j<row.length;j++) {
      let color="";
      if (colorsHTML[i][j]!="") color=" background-color: "+colorsHTML[i][j]+";";
      resultHTML+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+color+"\">"+round(row[j])+"</td>\n";
    }
    let color="";
    if (colorsHTML[i][colorsHTML[i].length-1]!="") color=" background-color: "+colorsHTML[i][colorsHTML[i].length-1]+";";
    resultHTML+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;"+color+"\">"+round(dataB[i])+"</td>\n";
    resultHTML+="</tr>\n";
  }
  resultHTML+="</table>\n";

  /* LaTeX code */
  let resultLaTeX="\\begin{tabular}{|"+dataA[0].map(()=>"r").join("|")+"||r|}\n";
  resultLaTeX+="\\hline\n";
  for (let i=0;i<dataA.length;i++) {
    const row=[...dataA[i], dataB[i]];
    resultLaTeX+=row.map((cell,j)=>((colorsLaTeX[i][j]=='')?'':("\\cellcolor{"+colorsLaTeX[i][j]+"!75} "))+latex(cell)).join("&")+"\\\\\n";
    resultLaTeX+="\\hline\n";
  }
  resultLaTeX+="\\end{tabular}\n\n";

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Swaps two rows in matrix and vector.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Number} row1 Index of the first row to be swapped
 * @param {Number} row2 Index of the second row to be swapped
 * @returns Array containing the new matrix and the new vector
 */
function swapRows(dataA, dataB, row1, row2) {
  const tempA=dataA[row1]; dataA[row1]=dataA[row2]; dataA[row2]=tempA;
  const tempB=dataB[row1]; dataB[row1]=dataB[row2]; dataB[row2]=tempB;
  return [dataA,dataB];
}

/**
 * Swaps two columns in a matrix.
 * @param {Array} dataA Matrix A
 * @param {Number} col1 Index of the first column in A to be swapped
 * @param {Number} col2 Index of the second column in A to be swapped
 * @param {Array} colSwap Array for recording the column swaps
 * @returns Array containing the matrix and the column swap vector
 */
function swapCols(dataA, col1, col2, colSwap) {
  let temp=colSwap[col1]; colSwap[col1]=colSwap[col2]; colSwap[col2]=temp;
  for (let j=0;j<dataA.length;j++) {
    temp=dataA[j][col1]; dataA[j][col1]=dataA[j][col2]; dataA[j][col2]=temp;
  }
  return [dataA,colSwap];
}

/**
 * Performs a step towards the solution by generating a 1 in a column on the main diagonal and 0 otherwise.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Number} colNr  0-based number of the column to process
 * @param {Array} colSwap Array for recording the column swaps
 * @returns Object containing information on the processing steps
 */
function processColumn(dataA, dataB, colNr, colSwap) {
  let resultHTML="<hr><h3>"+language.GUI.col+" "+(colNr+1)+"</h3>\n";
  let resultLaTeX="\\vskip1em\\hrule\n\n\\subsection*{"+language.GUI.col+" "+(colNr+1)+"}\n\n";

  resultHTML+="<h4>"+language.GUI.generationOf+" a<sub>"+(colNr+1)+","+(colNr+1)+"</sub>=1</h4>\n";
  resultLaTeX+="\\subsubsection*{"+language.GUI.generationOf+" $a_{"+(colNr+1)+","+(colNr+1)+"}=1$}\n\n";

  /* Step 1: a(colNr,colNr)=1 */
  if (dataA[colNr][colNr]==1) {
    resultHTML+="<p>"+language.GUI.alreadyCase+"</p>\n";
    resultLaTeX+=language.GUI.alreadyCase+"\n\n";
  } else {
    /* Step 1a: Generate a(colNr,colNr)!=0 */
    if (Math.abs(dataA[colNr][colNr])<1E-14) {
      let next=-1;
      for (let j=colNr+1;j<dataA.length;j++) if (dataA[j][colNr]!=0) {next=j; break;}
      if (next>=0) {
        /* Swapping rows is sufficient */
        resultHTML+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
        resultLaTeX+=language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".\n\n";

        let arr=swapRows(dataA,dataB,colNr,next); dataA=arr[0]; dataB=arr[1];
        const lgs=showLGS(dataA,dataB);
        resultHTML+=lgs.html;
        resultLaTeX+=lgs.latex;
      } else {
        /* Swapping columns is sufficient */
        for (let j=colNr+1;j<dataA[0].length;j++) if (dataA[colNr][j]!=0) {next=j; break;}
        if (next>=0) {
          resultHTML+="<p>"+language.GUI.swappingCols+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
          resultLaTeX+=language.GUI.swappingCols+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".\n\n";
          let arr=swapCols(dataA,colNr,next,colSwap); dataA=arr[0]; colSwap=arr[1];
        } else {
          /* Rows and columns have to be swapped */
          let nextRow=-1, nextCol=-1;
          for (let j=colNr+1;j<dataA.length;j++) for (let k=colNr+1;k<dataA[0].length;k++) if (dataA[j][k]!=0) {nextRow=j; nextCol=k; break;}
          if (nextRow>=0) {
            resultHTML+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(nextRow+1)+" "+language.GUI.swappingRowsCols+" "+(colNr+1)+" "+language.GUI.and+" "+(nextCol+1)+".</p>\n";
            resultLaTeX+=language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(nextRow+1)+" "+language.GUI.swappingRowsCols+" "+(colNr+1)+" "+language.GUI.and+" "+(nextCol+1)+".\n\n";
            let arr=swapRows(dataA,dataB,colNr,nextRow); dataA=arr[0]; dataB=arr[1];
            arr=swapCols(dataA,colNr,nextCol,colSwap); dataA=arr[0]; colSwap=arr[1];
            const lgs=showLGS(dataA,dataB);
            resultHTML+=lgs.html;
            resultLaTeX+=lgs.latex;
          } else {
            /* Nothing works */
            resultHTML+="<p>"+language.GUI.notPossible+"</p>\n";
            resultLaTeX+=language.GUI.notPossible+"\n\n";
            return {a: roundToSetDigits(dataA), b: roundToSetDigits(dataB), ok: false, html: resultHTML, latex: resultLaTeX, colSwap: colSwap};
          }
        }
      }
    }

    /* Step 1b: a(colNr,colNr)!=0, transform to =1 */
    if (dataA[colNr][colNr]!=1) {
      const f=dataA[colNr][colNr];
      const m=(f<0)?"-":"";
      const f2=Math.abs(f);
      let f3, f4;
      if (f2%1!=0) {
        f3=m+"1/"+round(f2)+"="+m+round(1/f2);
        f4="$"+m+"\\frac{1}{"+latex(f2)+"}="+m+latex(1/f2)+"$";
      } else {
        f3=m+"1/"+f2;
        f4="$"+m+"\\frac{1}{"+f2+"}$";
      }
      resultHTML+="<p>"+language.GUI.multiplyRow1+" "+(colNr+1)+language.GUI.multiplyRow2+" "+f3+".<p>\n";
      resultLaTeX+=language.GUI.multiplyRow1+" "+(colNr+1)+language.GUI.multiplyRow2+" "+f4+".\n\n";
      for (let j=0;j<dataA[colNr].length;j++) dataA[colNr][j]/=f;
      dataB[colNr]/=f;
      const lgs=showLGSHighlightRow(dataA,dataB,colNr,colNr);
      resultHTML+=lgs.html;
      resultLaTeX+=lgs.latex;
    }
  }

  /* Step 2: a(i,colNr)=0 for i!=colNr */
  resultHTML+="<h4>"+language.GUI.generationOfZeros+" a<sub>i,"+(colNr+1)+"</sub> "+language.GUI.for+" i&ne;"+(colNr+1)+"</h4>\n";
  resultLaTeX+="\\subsubsection*{"+language.GUI.generationOfZeros+" $a_{i,"+(colNr+1)+"}$ "+language.GUI.for+" $i\\neq "+(colNr+1)+"$}\n\n";
  let changeNeeded=false;
  for (let j=0;j<dataA.length;j++) if (dataA[j][colNr]!=0 && j!=colNr) {
    changeNeeded=true;
    const f=-dataA[j][colNr];
    resultHTML+="<p>"+language.GUI.addRow1+" "+((f<0)?("("+round(f)+")"):round(f))+language.GUI.addRow2+" "+(colNr+1)+language.GUI.addRow3+" "+(j+1)+language.GUI.addRow4+".</p>\n";
    resultLaTeX+=language.GUI.addRow1+" "+((f<0)?("("+latex(f)+")"):latex(f))+language.GUI.addRow2+" "+(colNr+1)+language.GUI.addRow3+" "+(j+1)+language.GUI.addRow4+".\n\n";
    for (let k=colNr;k<dataA[j].length;k++) dataA[j][k]+=f*dataA[colNr][k];
    dataB[j]+=f*dataB[colNr];
    const lgs=showLGSHighlightRow(dataA,dataB,j,colNr);
    resultHTML+=lgs.html;
    resultLaTeX+=lgs.latex;
  }
  if (!changeNeeded) {
    resultHTML+="<p>"+language.GUI.alreadyCase+"</p>\n";
    resultLaTeX+=language.GUI.alreadyCase+"\n\n";
  }

  return {a: roundToSetDigits(dataA), b: roundToSetDigits(dataB), ok: true, html: resultHTML, latex: resultLaTeX, colSwap: colSwap};
}

/**
 * Performs a step towards the solution by generating a 1 in a column on the main diagonal and 0 otherwise.
 * This is the version for processing Fraction objects.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Number} colNr  0-based number of the column to process
 * @param {Array} colSwap Array for recording the column swaps
 * @returns Object containing information on the processing steps
 */
function processColumnFractionMode(dataA, dataB, colNr, colSwap) {
  let resultHTML="<hr><h3>"+language.GUI.col+" "+(colNr+1)+"</h3>\n";
  let resultLaTeX="\\vskip1em\\hrule\n\n\\subsection*{"+language.GUI.col+" "+(colNr+1)+"}\n\n";

  resultHTML+="<h4>"+language.GUI.generationOf+" a<sub>"+(colNr+1)+","+(colNr+1)+"</sub>=1</h4>\n";
  resultLaTeX+="\\subsubsection*{"+language.GUI.generationOf+" $a_{"+(colNr+1)+","+(colNr+1)+"}=1$}\n\n";

  /* Step 1: a(colNr,colNr)=1 */
  if (dataA[colNr][colNr].is(1)) {
    resultHTML+="<p>"+language.GUI.alreadyCase+"</p>\n";
    resultLaTeX+=language.GUI.alreadyCase+"\n\n";
  } else {
    /* Step 1a: Generate a(colNr,colNr)!=0 */
    if (dataA[colNr][colNr].is(0)) {
      let next=-1;
      for (let j=colNr+1;j<dataA.length;j++) if (!dataA[j][colNr].is(0)) {next=j; break;}
      if (next>=0) {
        /* Swapping rows is sufficient */
        resultHTML+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
        resultLaTeX+=language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".\n\n";
        let arr=swapRows(dataA,dataB,colNr,next); dataA=arr[0]; dataB=arr[1];
        const lgs=showLGS(dataA,dataB);
        resultHTML+=lgs.html;
        resultLaTeX+=lgs.latex;
      } else {
        /* Swapping columns is sufficient */
        for (let j=colNr+1;j<dataA[0].length;j++) if (!dataA[colNr][j].is(0)) {next=j; break;}
        if (next>=0) {
          resultHTML+="<p>"+language.GUI.swappingCols+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
          resultLaTeX+=language.GUI.swappingCols+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".\n\n";
          let arr=swapCols(dataA,colNr,next,colSwap); dataA=arr[0]; colSwap=arr[1];
        } else {
          /* Rows and columns have to be swapped */
          let nextRow=-1, nextCol=-1;
          for (let j=colNr+1;j<dataA.length;j++) for (let k=colNr+1;k<dataA[0].length;k++) if (!dataA[j][k].is(0)) {nextRow=j; nextCol=k; break;}
          if (nextRow>=0) {
            resultHTML+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(nextRow+1)+" "+language.GUI.swappingRowsCols+" "+(colNr+1)+" "+language.GUI.and+" "+(nextCol+1)+".</p>\n";
            resultLaTeX+=language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(nextRow+1)+" "+language.GUI.swappingRowsCols+" "+(colNr+1)+" "+language.GUI.and+" "+(nextCol+1)+".\n\n";
            let arr=swapRows(dataA,dataB,colNr,nextRow); dataA=arr[0]; dataB=arr[1];
            arr=swapCols(dataA,colNr,nextCol,colSwap); dataA=arr[0]; colSwap=arr[1];
            const lgs=showLGS(dataA,dataB);
            resultHTML+=lgs.html;
            resultLaTeX+=lgs.latex;
          } else {
            /* Nothing works */
            resultHTML+="<p>"+language.GUI.notPossible+"</p>\n";
            resultLaTeX+=language.GUI.notPossible+"\n\n";
            return {a: dataA, b: dataB, ok: false, html: resultHTML, latex: resultLaTeX, colSwap: colSwap};
          }
        }
      }
    }

    /* Step 1b: a(colNr,colNr)!=0, transform to =1 */
    if (!dataA[colNr][colNr].is(1)) {
      const f=dataA[colNr][colNr];
      const m=(f.number<0)?"-":"";
      const f2=f.abs;
      const f3=(f2.inv.denominator!=1)?(m+f2.inv):(m+f2.inv.numerator);
      const f4=(f2.inv.denominator!=1)?(m+f2.inv.toLaTeX()):(m+f2.inv.numerator.toLaTeX());
      resultHTML+="<p>"+language.GUI.multiplyRow1+" "+(colNr+1)+language.GUI.multiplyRow2+" "+f3+".<p>\n";
      resultLaTeX+=language.GUI.multiplyRow1+" "+(colNr+1)+language.GUI.multiplyRow2+" $"+f4+"$.\n\n";
      for (let j=0;j<dataA[colNr].length;j++) dataA[colNr][j]=dataA[colNr][j].div(f);
      dataB[colNr]=dataB[colNr].div(f);
      const lgs=showLGSHighlightRow(dataA,dataB,colNr,colNr);
      resultHTML+=lgs.html;
      resultLaTeX+=lgs.latex;
    }
  }

  /* Step 2: a(i,colNr)=0 for i!=colNr */
  resultHTML+="<h4>"+language.GUI.generationOfZeros+" a<sub>i,"+(colNr+1)+"</sub> "+language.GUI.for+" i&ne;"+(colNr+1)+"</h4>\n";
  resultLaTeX+="\\subsubsection*{"+language.GUI.generationOfZeros+" $a_{i,"+(colNr+1)+"}$ "+language.GUI.for+" $i\\neq"+(colNr+1)+"$}\n\n";
  let changeNeeded=false;
  for (let j=0;j<dataA.length;j++) if (!dataA[j][colNr].is(0) && j!=colNr) {
    changeNeeded=true;
    const f=dataA[j][colNr].minus;
    resultHTML+="<p>"+language.GUI.addRow1+" "+((f.numerator<0)?("("+round(f)+")"):round(f))+language.GUI.addRow2+" "+(colNr+1)+language.GUI.addRow3+" "+(j+1)+language.GUI.addRow4+".</p>\n";
    resultLaTeX+=language.GUI.addRow1+" "+((f.numerator<0)?("("+latex(f)+")"):latex(f))+language.GUI.addRow2+" "+(colNr+1)+language.GUI.addRow3+" "+(j+1)+language.GUI.addRow4+".\n\n";
    for (let k=colNr;k<dataA[j].length;k++) dataA[j][k]=dataA[j][k].add(dataA[colNr][k].mul(f));
    dataB[j]=dataB[j].add(dataB[colNr].mul(f));
    const lgs=showLGSHighlightRow(dataA,dataB,j,colNr);
    resultHTML+=lgs.html;
    resultLaTeX+=lgs.latex;
  }
  if (!changeNeeded) {
    resultHTML+="<p>"+language.GUI.alreadyCase+"</p>\n";
    resultLaTeX+=language.GUI.alreadyCase+"\n\n";
  }

  return {a: dataA, b: dataB, ok: true, html: resultHTML, latex: resultLaTeX, colSwap: colSwap};
}

/**
 * Shows the solution set.
 * @param {Array} L List of vectors
 * @param {String} name Title
 * @param {Boolean} useColors Use colors for the solution?
 * @param {Number} firstZeroRow Index of the first row consisting of zeros
 * @returns HTML and LaTeX code for the solution set
 */
function showL(L, name, useColors, firstZeroRow) {
  let c1, c2;
  if (document.documentElement.dataset.bsTheme=='dark') {
    c1='#115';
    c2='#151';
  } else {
    c1='#AAF';
    c2='#AFA';
  }

  const rows=L[0].length;

  /* HTML code */
  let resultHTML="<table style=\"border-collapse: collapse;\">\n";
  for (let i=0;i<rows;i++) {
    resultHTML+="<tr>\n";
    if (i==0) resultHTML+="<td rowspan=\""+rows+"\">"+name+"=</td>\n";
    for (let j=0;j<L.length;j++) {
      if (j>0 && i==0) resultHTML+="<td rowspan=\""+rows+"\">&nbsp;+&lambda;<sub>"+j+"</sub>&nbsp;</td>\n";
      if (i==0) resultHTML+="<td rowspan=\""+rows+"\"><span style=\"font-size: "+rows+"00%\">(</span></td>\n";
      let color="";
      if (useColors && (i<firstZeroRow || firstZeroRow<0)) {
        if (j==0) color=c1; else color=c2;
        color=" background-color: "+color+";";
      }
      resultHTML+="<td style=\"border: 1px solid lightgray;"+color+"\">"+round(L[j][i])+"<td>\n";
      if (i==0) resultHTML+="<td rowspan=\""+rows+"\"><span style=\"font-size: "+rows+"00%\">)</span></td>\n";
    }
    resultHTML+="</tr>\n";
  }
  resultHTML+="</table>\n";

  /* LaTeX code */
  let resultLaTeX="$$\n";
  resultLaTeX+=name.replaceAll("x*","x^*")+"=\n";
  for (let i=0;i<L.length;i++) {
    const vec=L[i];
    if (i>0) resultLaTeX+="+\\lambda_{"+i+"}\\cdot";
    resultLaTeX+="\\begin{pmatrix}"+vec.map((value,j)=>{
      let c="";
      if (useColors && (j<firstZeroRow || firstZeroRow<0)) {
        if (i==0) c="\\color{blue}"; else c="\\color{green}";
      }
      return c+latex(value,false);
    }).join("\\\\")+"\\end{pmatrix}\n";
  }
  resultLaTeX+="$$\n";

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Calculates the diagonal form (as far as possible) for the LGS.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Array} colSwap List containing the swapped columns
 * @param {Number} firstZeroRow Index of the first row consisting of zeros
 * @returns HTML and LaTeX code for the solution
 */
function processSolution(dataA, dataB, colSwap, firstZeroRow) {
  let resultHTML="";
  let resultLaTeX="";

  resultHTML+="<hr><h3>"+language.GUI.solutionOfLGS+"</h3>\n";
  resultLaTeX+="\\vskip1em\\hrule\n\n\\subsection*{"+language.GUI.solutionOfLGS+"}\n\n";

  /* Showing the LGS after the last transformation step with colors to show the different areas. */
  let c1, c2, c3, c4;
  if (document.documentElement.dataset.bsTheme=='dark') {
    c1='#115';
    c2='#151';
    c3='#511';
    c4='#555';
  } else {
    c1='#AAF';
    c2='#AFA';
    c3='#FBB';
    c4='lightgray';
  }
  const colorsHTML=[];
  const colorsLaTeX=[];
  for (let i=0;i<dataA.length;i++) {
    const rowHTML=[];
    const rowLaTeX=[];
    for (let j=0;j<=dataA[0].length;j++) {
      if (i<firstZeroRow || firstZeroRow<0) {
        if (j==dataA[0].length) {rowHTML.push(c1); rowLaTeX.push("cellblue"); continue;}
        if (firstZeroRow>=0 && j>=firstZeroRow) {rowHTML.push(c2); rowLaTeX.push("cellgreen"); continue;}
        rowHTML.push((i==j)?c3:"");
        rowLaTeX.push((i==j)?"cellred":"");
      } else {
        rowHTML.push((j<dataA[0].length || dataB[i]==0)?c4:c3);
        rowLaTeX.push((j<dataA[0].length || dataB[i]==0)?"cellgray":"cellred");
      }
    }
    colorsHTML.push(rowHTML);
    colorsLaTeX.push(rowLaTeX);
  }
  const lgs=showLGSCustomHighlight(dataA,dataB,colorsHTML,colorsLaTeX);
  resultHTML+=lgs.html;
  resultLaTeX+=lgs.latex;

  /* No solution? */
  if (firstZeroRow>=0) for (let i=firstZeroRow;i<dataA.length;i++) if (dataB[i]!=0) {
    resultHTML+="<p>"+language.GUI.noSolution1+(i+1)+" "+language.GUI.noSolution2+": <span style=\"color: red;\">0="+round(dataB[i])+"</span>, "+language.GUI.noSolution3+".</p>\n";
    resultLaTeX+=language.GUI.noSolution1+(i+1)+" "+language.GUI.noSolution2+": {\\color{red}0="+latex(dataB[i])+"}, "+language.GUI.noSolution3+".\n\n";
    return {html: resultHTML, latex: resultLaTeX};
  }

  /* Info text: exactly one solution or infinite many solutions */
  if (firstZeroRow>=0) {
    resultHTML+="<p>"+language.GUI.underdetermined1+" "+(dataA[0].length-firstZeroRow)+language.GUI.underdetermined2+"<br>";
    resultHTML+="("+language.GUI.underdetermined3+" "+dataA[0].length+" "+language.GUI.underdetermined4+" "+firstZeroRow+" "+language.GUI.underdetermined5+")<br>";
    resultHTML+=language.GUI.underdetermined6;
    resultHTML+="</p>\n";
    resultLaTeX+=language.GUI.underdetermined1+" "+(dataA[0].length-firstZeroRow)+language.GUI.underdetermined2+"\\hfill\\\\\n";
    resultLaTeX+="("+language.GUI.underdetermined3+" "+dataA[0].length+" "+language.GUI.underdetermined4+" "+firstZeroRow+" "+language.GUI.underdetermined5+")\\hfill\\\\\n";
    resultLaTeX+=language.GUI.underdetermined6LaTeX+"\n\n";
  } else {
    resultHTML+=language.GUI.oneSolution1;
    resultHTML+=language.GUI.oneSolution2+"\n";
    resultLaTeX+=language.GUI.oneSolutionLaTeX;
  }

  /* Generation of the solution set */
  const L=[];
  let lsg=[];
  for (let i=0;i<Math.min(dataA[0].length,dataB.length);i++) lsg.push(dataB[i]);
  for (let i=Math.min(dataA[0].length,dataB.length);i<dataA[0].length;i++) lsg.push(0);
  L.push(lsg);
  if (firstZeroRow>=0) for (let i=0;i<dataA[0].length-firstZeroRow;i++) {
    lsg=[];
    for (let j=0;j<firstZeroRow;j++) lsg.push(-dataA[j][firstZeroRow+i]);
    for (let j=firstZeroRow;j<dataA[0].length;j++) lsg.push((j-firstZeroRow==i)?1:0);
    L.push(lsg);
  }

  /* Have columns been swapped? */
  let swapped=false;
  for (let i=0;i<colSwap.length;i++) if (colSwap[i]!=i) {swapped=true; break;}

  /* Show the solution set (before the columns are reswapped) */
  if (swapped) {
    resultHTML+="<p>"+language.GUI.reswapBefore+":</p>\n";
    resultLaTeX+=language.GUI.reswapBefore+":\n\n";
  }
  if (!swapped) {
    resultHTML+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
    resultLaTeX+="\\fbox{\\parbox{\\textwidth}{\n";
  }
  const solution1=showL(L,swapped?"x*":"x",true,firstZeroRow);
  resultHTML+=solution1.html;
  resultLaTeX+=solution1.latex;
  if (!swapped) {
    resultHTML+="</div>\n";
    resultLaTeX+="}}\n\n";
  } else {
    resultLaTeX+="\n";
  }

  /* Reswapping and showing the final results */
  if (swapped) {
    resultHTML+="<p>"+language.GUI.reswap+": ";
    for (let i=0;i<colSwap.length;i++) resultHTML+=((i>0)?",":"")+" "+(i+1)+"&rarr;"+(colSwap[i]+1);
    resultHTML+="</p>\n";
    resultLaTeX+=language.GUI.reswap+": ";
    for (let i=0;i<colSwap.length;i++) resultLaTeX+=((i>0)?",":"")+" $"+(i+1)+"\\to "+(colSwap[i]+1)+"$";
    resultLaTeX+="\n\n";
    resultHTML+="<p>"+language.GUI.finalSolution+":</p>\n";
    resultLaTeX+=language.GUI.finalSolution+":\n\n";
    const newL=[];
    for (let i=0;i<L.length;i++) {const lsg=[]; for (let j=0;j<L[i].length;j++) lsg.push(0); newL.push(lsg);}
    for (let i=0;i<colSwap.length;i++) for (let j=0;j<L.length;j++) newL[j][colSwap[i]]=L[j][i];
    resultHTML+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
    resultLaTeX+="\\fbox{\\parbox{\\textwidth}{\n";
    const solution2=showL(newL,"x",false,firstZeroRow);
    resultHTML+=solution2.html;
    resultLaTeX+=solution2.latex;
    resultHTML+="</div>\n";
    resultLaTeX+="}}\n\n";
  }

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Calculates the diagonal form (as far as possible) for the LGS.
 * This is the version for processing Fraction objects.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Array} colSwap List containing the swapped columns
 * @param {Number} firstZeroRow Index of the first row consisting of zeros
 * @returns HTML and LaTeX code for the solution
 */
function processSolutionFractionMode(dataA, dataB, colSwap, firstZeroRow) {
  let resultHTML="";
  let resultLaTeX="";

  resultHTML+="<hr><h3>"+language.GUI.solutionOfLGS+"</h3>\n";
  resultLaTeX+="\\vskip1em\\hrule\n\n\\subsection*{"+language.GUI.solutionOfLGS+"}\n\n";

  /* Showing the LGS after the last transformation step with colors to show the different areas. */
  let c1, c2, c3, c4;
  if (document.documentElement.dataset.bsTheme=='dark') {
    c1='#115';
    c2='#151';
    c3='#511';
    c4='#555';
  } else {
    c1='#AAF';
    c2='#AFA';
    c3='#FBB';
    c4='lightgray';
  }
  const colorsHTML=[];
  const colorsLaTeX=[];
  for (let i=0;i<dataA.length;i++) {
    const rowHTML=[];
    const rowLaTeX=[];
    for (let j=0;j<=dataA[0].length;j++) {
      if (i<firstZeroRow || firstZeroRow<0) {
        if (j==dataA[0].length) {rowHTML.push(c1); rowLaTeX.push("cellblue"); continue;}
        if (firstZeroRow>=0 && j>=firstZeroRow) {rowHTML.push(c2); rowLaTeX.push("cellgreen"); continue;}
        rowHTML.push((i==j)?c3:"");
        rowLaTeX.push((i==j)?"cellred":"");
      } else {
        rowHTML.push((j<dataA[0].length || dataB[i].is(0))?c4:c3);
        rowLaTeX.push((j<dataA[0].length || dataB[i].is(0))?"cellgray":"cellred");
      }
    }
    colorsHTML.push(rowHTML);
    colorsLaTeX.push(rowLaTeX);
  }
  const lgs=showLGSCustomHighlight(dataA,dataB,colorsHTML,colorsLaTeX);
  resultHTML+=lgs.html;
  resultLaTeX+=lgs.latex;

  /* No solution? */
  if (firstZeroRow>=0) for (let i=firstZeroRow;i<dataA.length;i++) if (!dataB[i].is(0)) {
    resultHTML+="<p>"+language.GUI.noSolution1+(i+1)+" "+language.GUI.noSolution2+": <span style=\"color: red;\">0="+round(dataB[i])+"</span>, "+language.GUI.noSolution3+".</p>\n";
    resultLaTeX+=language.GUI.noSolution1+(i+1)+" "+language.GUI.noSolution2+": {\\color{red}0="+latex(dataB[i])+"}, "+language.GUI.noSolution3+".\n\n";
    return {html: resultHTML, latex: resultLaTeX};
  }

  /* Info text: exactly one solution or infinite many solutions */
  if (firstZeroRow>=0) {
    resultHTML+="<p>"+language.GUI.underdetermined1+" "+(dataA[0].length-firstZeroRow)+language.GUI.underdetermined2+"<br>";
    resultHTML+="("+language.GUI.underdetermined3+" "+dataA[0].length+" "+language.GUI.underdetermined4+" "+firstZeroRow+" "+language.GUI.underdetermined5+")<br>";
    resultHTML+=language.GUI.underdetermined6;
    resultHTML+="</p>\n";
    resultLaTeX+=language.GUI.underdetermined1+" "+(dataA[0].length-firstZeroRow)+language.GUI.underdetermined2+"\\hfill\\\\\n";
    resultLaTeX+="("+language.GUI.underdetermined3+" "+dataA[0].length+" "+language.GUI.underdetermined4+" "+firstZeroRow+" "+language.GUI.underdetermined5+")\\hfill\\\\\n";
    resultLaTeX+=language.GUI.underdetermined6LaTeX+"\n\n";
  } else {
    resultHTML+=language.GUI.oneSolution1;
    resultHTML+=language.GUI.oneSolution2+"\n";
    resultLaTeX+=language.GUI.oneSolutionLaTeX+"\n\n";
  }

  /* Generation of the solution set */
  const L=[];
  let lsg=[];
  for (let i=0;i<Math.min(dataA[0].length,dataB.length);i++) lsg.push(dataB[i]);
  for (let i=Math.min(dataA[0].length,dataB.length);i<dataA[0].length;i++) lsg.push(0);
  L.push(lsg);
  if (firstZeroRow>=0) for (let i=0;i<dataA[0].length-firstZeroRow;i++) {
    lsg=[];
    for (let j=0;j<firstZeroRow;j++) lsg.push(dataA[j][firstZeroRow+i].minus);
    for (let j=firstZeroRow;j<dataA[0].length;j++) lsg.push((j-firstZeroRow==i)?1:0);
    L.push(lsg);
  }

  /* Have columns been swapped? */
  let swapped=false;
  for (let i=0;i<colSwap.length;i++) if (colSwap[i]!=i) {swapped=true; break;}

  /* Show the solution set (before the columns are reswapped) */
  if (swapped) {
    resultHTML+="<p>"+language.GUI.reswapBefore+":</p>\n";
    resultLaTeX+=language.GUI.reswapBefore+":\n\n";
  }
  if (!swapped) {
    resultHTML+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
    resultLaTeX+="\\fbox{\\parbox{\\textwidth}{\n";
  }
  const solution1=showL(L,swapped?"x*":"x",true,firstZeroRow);
  resultHTML+=solution1.html;
  resultLaTeX+=solution1.latex;
  if (!swapped) {
    resultHTML+="</div>\n";
    resultLaTeX+="}}\n\n";
  } else {
    resultLaTeX+="\n\n";
  }

  /* Reswapping and showing the final results */
  if (swapped) {
    resultHTML+="<p>"+language.GUI.reswap+": ";
    for (let i=0;i<colSwap.length;i++) resultHTML+=((i>0)?",":"")+" "+(i+1)+"&rarr;"+(colSwap[i]+1);
    resultHTML+="</p>\n";
    resultLaTeX+=language.GUI.reswap+": ";
    for (let i=0;i<colSwap.length;i++) resultLaTeX+=((i>0)?",":"")+" $"+(i+1)+"\\to "+(colSwap[i]+1)+"$";
    resultLaTeX+="\n\n";
    resultHTML+="<p>"+language.GUI.finalSolution+":</p>\n";
    resultLaTeX+=language.GUI.finalSolution+":\n\n";
    const newL=[];
    for (let i=0;i<L.length;i++) {const lsg=[]; for (let j=0;j<L[i].length;j++) lsg.push(new Fraction(0,1)); newL.push(lsg);}
    for (let i=0;i<colSwap.length;i++) for (let j=0;j<L.length;j++) newL[j][colSwap[i]]=L[j][i];
    resultHTML+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
    resultLaTeX+="\\fbox{\\parbox{\\textwidth}{\n";
    const solution2=showL(newL,"x",false,firstZeroRow);
    resultHTML+=solution2.html;
    resultLaTeX+=solution2.latex;
    resultHTML+="</div>\n";
    resultLaTeX+="}}\n\n";
  }

  return {html: resultHTML, latex: resultLaTeX};
}

/**
 * Solves a LGS.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Number} digits Number of digits to display
 * @returns Solution as HTML and LaTeX code
 */
function calcSolution(dataA, dataB, digits) {
  roundDigits=Math.max(1,Math.min(13,digits));

  const fractionMode=dataB[0] instanceof Fraction;

  const result={html: "", latex: ""};
  result.latex+="\\documentclass[a4paper]{article}\n\n";
  result.latex+="\\usepackage[utf8]{inputenc}\n";
  result.latex+="\\usepackage[T1]{fontenc}\n";
  result.latex+="\\usepackage{amsmath}\n";
  result.latex+="\\usepackage{xcolor}\n";
  result.latex+="\\usepackage{colortbl}\n\n";
  result.latex+="\\definecolor{cellred}{rgb}{0.8,0,0}\n";
  result.latex+="\\definecolor{green}{rgb}{0,0.8,0}\n";
  result.latex+="\\definecolor{blue}{rgb}{0,0,0.8}\n";
  result.latex+="\\definecolor{lightgreen}{rgb}{0.1,0.1,0.1}\n";
  result.latex+="\\definecolor{cellred}{rgb}{1,0.733,0.733}\n";
  result.latex+="\\definecolor{cellgreen}{rgb}{0.667,1,0.667}\n";
  result.latex+="\\definecolor{cellblue}{rgb}{0.667,0.667,1}\n";
  result.latex+="\\definecolor{cellgray}{rgb}{0.827,0.827,0.827}\n\n";
  result.latex+="\\setlength{\\parindent}{0em}\n\n";
  result.latex+="\\begin{document}\n\n";

  let colSwap=[];
  for (let i=0;i<dataA.length;i++) colSwap.push(i);

  result.html+="<h3>"+language.GUI.initialSystem+"</h3>\n";
  result.latex+="\\subsection*{"+language.GUI.initialSystem+"}\n\n";
  const initialSystem=showLGS(dataA,dataB);
  result.html+=initialSystem.html;
  result.latex+=initialSystem.latex;

  let firstZeroRow=-1;
  for (let i=0;i<Math.min(dataA.length,dataA[0].length);i++) {
    const stepResult=fractionMode?processColumnFractionMode(dataA,dataB,i,colSwap):processColumn(dataA,dataB,i,colSwap);
    dataA=stepResult.a; dataB=stepResult.b; result.html+=stepResult.html; result.latex+=stepResult.latex; colSwap=stepResult.colSwap;
    if (!stepResult.ok) {firstZeroRow=i; break;}
  }

  const steps=fractionMode?processSolutionFractionMode(dataA,dataB,colSwap,firstZeroRow):processSolution(dataA,dataB,colSwap,firstZeroRow);
  result.html+=steps.html;
  result.latex+=steps.latex;

  result.latex+="\\end{document}\n";

  return result;
}
