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

/**
 * Reads the values of M and b from the html input elements.
 * @param {Array} htmlM Matrix M in form of html input elements
 * @param {Array} htmlb Vector b in form of html input elements
 * @returns Returns in case of success a two element array containing M and b, otherwise a string with an error message
 */
function checkLGS(htmlM, htmlb) {
  const M=[];
  for (let i=0;i<htmlM.length;i++) {
    const row=[];
    for (let j=0;j<htmlM[i].length;j++) {
        const num=parseFloat(htmlM[i][j].value.replaceAll(",","."));
        if (isNaN(num)) return language.GUI.errorM;
        row.push(num);
    }
    M.push(row);
  }

  const b=[];
  for (let i=0;i<htmlb.length;i++) {
    const num=parseFloat(htmlb[i].value.replaceAll(",","."));
    if (isNaN(num)) return language.GUI.errorb;
    b.push(num);
  }

  return [M,b];
}

/**
 * Number of digits to be shown in round.
 */
let roundDigits=3;

/**
 * Rounds a number to roundDigits digits and converts it in a local string.
 * @param {Number} f Number to be convered to a string
 * @returns Number as local string
 */
function round(f) {
  let s;
  s=f.toLocaleString(undefined, {minimumFractionDigits: roundDigits});
  if (s.indexOf(".")>=0 || s.indexOf(",")>=0) {
    while (s[s.length-1]=="0") s=s.substring(0,s.length-1);
    if (s[s.length-1]=="." || s[s.length-1]==",") s=s.substring(0,s.length-1);
  }
  return (s=='-0')?"0":s;
}

/**
 * Generates HTML code showing a LGS.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @returns HTML code for Mx=b
 */
function showLGS(dataA, dataB) {
  let result="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
  for (let i=0;i<dataA.length;i++) {
    const row=dataA[i];
    result+="<tr>";
    for (let j=0;j<row.length;j++) result+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+"\">"+round(row[j])+"</td>\n";
    result+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;\">"+round(dataB[i])+"</td>\n";
    result+="</tr>\n";
  }
  result+="</table>\n";
  return result;
}

/**
 * Generates HTML code showing a LGS and highlights a column and a row.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Number} rowNr Row to be highlighted (0-based)
 * @param {Number} colNr Comumn to be highlighted (0-based)
 * @returns HTML code for Mx=b
 */
function showLGSHighlightRow(dataA, dataB, rowNr, colNr) {
  let result="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
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
    result+="<tr>";
    for (let j=0;j<row.length;j++) {
      const color2=(color!="" && j==colNr)?("background-color: "+c2+";"):color;
      result+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+color2+"\">"+round(row[j])+"</td>\n";
    }
    const color2=(color!="" && row.length==colNr)?("background-color: "+color2+";"):color;
    result+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;"+c2+"\">"+round(dataB[i])+"</td>\n";
    result+="</tr>\n";
  }
  result+="</table>\n";
  return result;
}

/**
 * Generates HTML code showing a LGS and uses user-defined background colors.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Array} colors User defined colors for the cells
 * @returns HTML code for Mx=b
 */
function showLGSCustomHighlight(dataA, dataB, colors) {
  let result="<table style=\"border-collapse: collapse; border: 1px solid lightgray; margin-bottom: 10px;\">\n";
  for (let i=0;i<dataA.length;i++) {
    const row=dataA[i];
    result+="<tr>";
    for (let j=0;j<row.length;j++) {
      let color="";
      if (colors[i][j]!="") color=" background-color: "+colors[i][j]+";";
      result+="<td style=\"padding: 5px; border: 1px solid lightgray;"+((j==row.length-1)?" border-right: 1px solid black;":"")+color+"\">"+round(row[j])+"</td>\n";
    }
    let color="";
    if (colors[i][colors[i].length-1]!="") color=" background-color: "+colors[i][colors[i].length-1]+";";
    result+="<td style=\"padding: 5px; padding-left: 10px; border: 1px solid lightgray;"+color+"\">"+round(dataB[i])+"</td>\n";
    result+="</tr>\n";
  }
  result+="</table>\n";
  return result;
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

/* Führt einen Schritt hin zur Lösung durch, in dem in einer Spalte auf der Hauptdiagonalen eine 1 und sonst 0 erzeugt wird */
function processColumn(dataA,dataB,colNr,colSwap) {
  let result="<hr><h3>"+language.GUI.col+" "+(colNr+1)+"</h3>\n";

  result+="<h4>"+language.GUI.generationOf+" a<sub>"+(colNr+1)+","+(colNr+1)+"</sub>=1</h4>\n";

  /* Step 1: a(colNr,colNr)=1 */
  if (dataA[colNr][colNr]==1) {
    result+="<p>"+language.GUI.alreadyCase+"</p>\n";
  } else {
    /* Step 1a: Generate a(colNr,colNr)!=0 */
    if (dataA[colNr][colNr]==0) {
      let next=-1;
      for (let j=colNr+1;j<dataA.length;j++) if (dataA[j][colNr]!=0) {next=j; break;}
      if (next>=0) {
        /* Swapping rows is sufficient */
        result+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
        let arr=swapRows(dataA,dataB,colNr,next); dataA=arr[0]; dataB=arr[1];
        result+=showLGS(dataA,dataB);
      } else {
        /* Swapping columns is sufficient */
        for (let j=colNr+1;j<dataA[0].length;j++) if (dataA[colNr][j]!=0) {next=j; break;}
        if (next>=0) {
          result+="<p>"+language.GUI.swappingCols+" "+(colNr+1)+" "+language.GUI.and+" "+(next+1)+".</p>\n";
          let arr=swapCols(dataA,colNr,next,colSwap); dataA=arr[0]; colSwap=arr[1];
        } else {
          /* Rows and columns have to be swapped */
          let nextRow=-1, nextCol=-1;
          for (let j=colNr+1;j<dataA.length;j++) for (let k=colNr+1;k<dataA[0].length;k++) if (dataA[j][k]!=0) {nextRow=j; nextCol=k; break;}
          if (nextRow>=0) {
            result+="<p>"+language.GUI.swappingRows+" "+(colNr+1)+" "+language.GUI.and+" "+(nextRow+1)+" "+language.GUI.swappingRowsCols+" "+(colNr+1)+" "+language.GUI.and+" "+(nextCol+1)+".</p>\n";
            let arr=swapRows(dataA,dataB,colNr,nextRow); dataA=arr[0]; dataB=arr[1];
            arr=swapCols(dataA,colNr,nextCol,colSwap); dataA=arr[0]; colSwap=arr[1];
          result+=showLGS(dataA,dataB);
          } else {
            /* Nothing works */
            result+="<p>"+language.GUI.notPossible+"</p>\n";
            return [dataA,dataB,false,result,colSwap];
          }
        }
      }
    }

    /* Step 1b: a(colNr,colNr)!=0, transform to =1 */
    if (dataA[colNr][colNr]!=1) {
      const f=dataA[colNr][colNr];
      const m=(f<0)?"-":"";
      const f2=Math.abs(f);
      let f3; if (f2%1!=0) f3=m+"1/"+round(f2)+"="+m+round(1/f2); else f3=m+"1/"+f2;
      result+="<p>"+language.GUI.multiplyRow1+" "+(colNr+1)+language.GUI.multiplyRow2+" "+f3+".<p>\n";
      for (let j=0;j<dataA[colNr].length;j++) dataA[colNr][j]/=f;
      dataB[colNr]/=f;
      result+=showLGSHighlightRow(dataA,dataB,colNr,colNr);
    }
  }

  /* Step 2: a(i,colNr)=0 for i!=colNr */
  result+="<h4>"+language.GUI.generationOfZeros+" a<sub>i,"+(colNr+1)+"</sub> "+language.GUI.for+" i&ne;"+(colNr+1)+"</h4>\n";
  let changeNeeded=false;
  for (let j=0;j<dataA.length;j++) if (dataA[j][colNr]!=0 && j!=colNr) {
    changeNeeded=true;
    const f=-dataA[j][colNr];
    result+="<p>"+language.GUI.addRow1+" "+((f<0)?("("+round(f)+")"):round(f))+language.GUI.addRow2+" "+(colNr+1)+language.GUI.addRow3+" "+(j+1)+language.GUI.addRow4+".</p>\n";
    for (let k=colNr;k<dataA[j].length;k++) dataA[j][k]+=f*dataA[colNr][k];
    dataB[j]+=f*dataB[colNr];
    result+=showLGSHighlightRow(dataA,dataB,j,colNr);
  }
  if (!changeNeeded) result+="<p>"+language.GUI.alreadyCase+"</p>\n";

  return [dataA,dataB,true,result,colSwap];
}

/**
 * Shows the solution set.
 * @param {Array} L List of vectors
 * @param {String} name Title
 * @param {Boolean} useColors Use colors for the solution?
 * @param {Number} firstZeroRow Index of the first row consisting of zeros
 * @returns HTML code for the solution set
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
  let result="<table style=\"border-collapse: collapse;\">\n";
  for (let i=0;i<rows;i++) {
    result+="<tr>\n";
    if (i==0) result+="<td rowspan=\""+rows+"\">"+name+"=</td>\n";
    for (let j=0;j<L.length;j++) {
      if (j>0 && i==0) result+="<td rowspan=\""+rows+"\">&nbsp;+&lambda;<sub>"+j+"</sub>&nbsp;</td>\n";
      if (i==0) result+="<td rowspan=\""+rows+"\"><span style=\"font-size: "+rows+"00%\">(</span></td>\n";
      let color="";
      if (useColors && (i<firstZeroRow || firstZeroRow<0)) {
        if (j==0) color=c1; else color=c2;
        color=" background-color: "+color+";";
      }
      result+="<td style=\"border: 1px solid lightgray;"+color+"\">"+round(L[j][i])+"<td>\n";
      if (i==0) result+="<td rowspan=\""+rows+"\"><span style=\"font-size: "+rows+"00%\">)</span></td>\n";
    }
    result+="</tr>\n";
  }
  result+="</table>\n";
  return result;
}

/**
 * Calculates the diagonal form (as far as possible) for the LGS.
 * @param {Array} dataA Matrix A
 * @param {Array} dataB Vector b
 * @param {Array} colSwap List containing the swapped columns
 * @param {Number} firstZeroRow Index of the first row consisting of zeros
 * @returns HTML code for the solution
 */
function processSolution(dataA, dataB, colSwap, firstZeroRow) {
  let result="";

  result+="<hr><h3>"+language.GUI.solutionOfLGS+"</h3>\n";

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
  const colors=[];
  for (let i=0;i<dataA.length;i++) {
    const row=[];
    for (let j=0;j<=dataA[0].length;j++) {
      if (i<firstZeroRow || firstZeroRow<0) {
        if (j==dataA[0].length) {row.push(c1); continue;}
        if (firstZeroRow>=0 && j>=firstZeroRow) {row.push(c2); continue;}
        row.push((i==j)?c3:"");
      } else {
        row.push((j<dataA[0].length || dataB[i]==0)?c4:'red');
      }
    }
    colors.push(row);
  }
  result+=showLGSCustomHighlight(dataA,dataB,colors);

  /* No solution? */
  if (firstZeroRow>=0) for (let i=firstZeroRow;i<dataA.length;i++) if (dataB[i]!=0) {
    result+="<p> "+language.GUI.noSolution1+(i+1)+" "+language.GUI.noSolution2+": <span style=\"color: red;\">0="+round(dataB[i])+"</span>, "+language.GUI.noSolution3+".</p>\n";
    return result;
  }

  /* Info text: exactly one solution or infinite many solutions */
  if (firstZeroRow>=0) {
    result+="<p>"+language.GUI.underdetermined1+" "+(dataA[0].length-firstZeroRow)+language.GUI.underdetermined2+".<br>";
    result+="("+language.GUI.underdetermined3+" "+dataA[0].length+" "+language.GUI.underdetermined4+" "+firstZeroRow+" "+language.GUI.underdetermined5+")<br>";
    result+=language.GUI.underdetermined6;
    result+="</p>\n";
  } else {
    result+=language.GUI.oneSolution1;
    result+=language.GUI.oneSolution2+"\n";
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
  if (swapped) result+="<p>"+language.GUI.reswapBefore+":</p>\n";
  if (!swapped) result+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
  result+=showL(L,swapped?"x*":"x",true,firstZeroRow);
  if (!swapped) result+="</div>\n";

  /* Reswapping and showing the final results */
  if (swapped) {
    result+="<p>"+language.GUI.reswap+":";
    for (let i=0;i<colSwap.length;i++) result+=((i>0)?",":"")+" "+(i+1)+"&rarr;"+(colSwap[i]+1);
    result+="</p>\n";
    result+="<p>"+language.GUI.finalSolution+":</p>\n";
    const newL=[];
    for (let i=0;i<L.length;i++) {const lsg=[]; for (let j=0;j<L[i].length;j++) lsg.push(0); newL.push(lsg);}
    for (let i=0;i<colSwap.length;i++) for (let j=0;j<L.length;j++) newL[j][colSwap[i]]=L[j][i];
    result+="<div style=\"border: 1px solid green; padding: 10px;\">\n";
    result+=showL(newL,"x",false,firstZeroRow);
    result+="</div>\n";
  }

  return result;
}

/**
 * Solves a LGS.
 * @param {Array} dataA Matrix M
 * @param {Array} dataB Vector b
 * @param {Number} digits Number of digits to display
 * @returns Solution as HTML code
 */
function calcSolution(dataA, dataB, digits) {
  roundDigits=Math.max(1,Math.min(14,digits));

  let result="";
  let colSwap=[];
  for (let i=0;i<dataA.length;i++) colSwap.push(i);

  result+="<h3>"+language.GUI.initialSystem+"</h3>\n";
  result+=showLGS(dataA,dataB);

  let firstZeroRow=-1;
  for (let i=0;i<Math.min(dataA.length,dataA[0].length);i++) {
    const arr=processColumn(dataA,dataB,i,colSwap);
    dataA=arr[0]; dataB=arr[1]; result+=arr[3]; colSwap=arr[4];
    if (!arr[2]) {firstZeroRow=i; break;}
  }

  result+=processSolution(dataA,dataB,colSwap,firstZeroRow);

  return result;
}
