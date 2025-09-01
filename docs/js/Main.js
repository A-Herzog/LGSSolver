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

export {isDesktopApp, initApp};

  import { Fraction } from "./Fraction.js";
import {language} from "./Language.js";
import {checkLGS, calcSolution} from "./Solver.js";

/**
 * Is the system running as Neutralions desktop app (true) or as a web page (false)?
 */
const isDesktopApp=(typeof(NL_OS)!='undefined');
if (isDesktopApp) {
  Neutralino.init();
  Neutralino.events.on("windowClose",()=>Neutralino.app.exit());
}

/**
 * Fills in the language strings to the GUI elements.
 */
function initGUILanguage() {
  /* Header */
  appName1.innerHTML=language.GUI.appName;
  languageButton.title=language.GUI.switchLanguageHint;
  languageButton.querySelector('.menuButtonTitleShort').innerHTML=language.GUI.switchLanguageShort;
  languageButton.querySelector('.menuButtonTitleLong').innerHTML=language.GUI.switchLanguage;
  languageButton.onclick=()=>{
    localStorage.setItem('selectedLanguage',language.GUI.switchLanguageMode);
    document.location.href=language.GUI.switchLanguageFile;
  }

  menuColorMode.title=language.GUI.tabColorMode;
  menuColorModeLight.innerHTML=language.GUI.tabColorModeLight;
  menuColorModeDark.innerHTML=language.GUI.tabColorModeDark;
  menuColorModeSystemDefault.innerHTML=language.GUI.tabColorModeSystemDefault;

  let selectedColorMode=localStorage.getItem('selectedColorMode');
  if (selectedColorMode==null) {
    menuColorModeSystemDefault.classList.add("bi-check");
    const mode=(document.documentElement.dataset.bsTheme=='dark')?language.GUI.tabColorModeDark:language.GUI.tabColorModeLight;
    menuColorModeSystemDefault.innerHTML=menuColorModeSystemDefault.innerHTML+" ("+mode+")";
  } else {
    if (document.documentElement.dataset.bsTheme=='dark') menuColorModeDark.classList.add("bi-check"); else menuColorModeLight.classList.add("bi-check");
  }

  /* Content */
  let option;
  mainInfo.innerHTML=language.GUI.mainInfo;
  rowCountLabel.innerHTML=language.GUI.rows+":";
  colCountLabel.innerHTML=language.GUI.cols+":";
  for (let i=2;i<=10;i++) {
    rowCount.appendChild(option=document.createElement("option"));
    option.value=i;
    option.innerHTML=i;
    option.selected=(i==3);
    colCount.appendChild(option=document.createElement("option"));
    option.value=i;
    option.innerHTML=i;
    option.selected=(i==3);
  }
  rowCount.onchange=()=>updateLGSTable();
  colCount.onchange=()=>updateLGSTable();
  digitsSelectLabel.innerHTML=language.GUI.digitsSelect+":";
  digitsSelect.appendChild(option=document.createElement("option"));
  option.innerHTML="3";
  option.selected=true;
  option.value=3;
  digitsSelect.appendChild(option=document.createElement("option"));
  option.innerHTML="5";
  option.value=5;
  digitsSelect.appendChild(option=document.createElement("option"));
  option.innerHTML=language.GUI.digitsSelectAll;
  option.value=14;
  digitsSelect.appendChild(option=document.createElement("option"));
  option.innerHTML=language.GUI.digitsSelectFraction;
  option.value=-1;
  digitsSelect.onchange=()=>checkInput();
  buttonResetM.onclick=()=>resetValues(0);
  buttonResetb.onclick=()=>resetValues(1);
  buttonExample.innerHTML=" "+language.GUI.example;
  buttonExample.onclick=()=>setValues(0);
  buttonRandom.innerHTML=" "+language.GUI.random;
  buttonRandom.onclick=()=>setValues(1);
  buttonSolve.innerHTML=" "+language.GUI.solve;
  buttonSolve.onclick=()=>solve();
  permalink.innerHTML=language.GUI.permalinkText;
  permalink.title=language.GUI.permalinkInfo;

  if (document.documentElement.dataset.bsTheme=='dark') {
    LGSAreaOuter.className="";
  }

  /* Footer */
  appName2.innerHTML=language.GUI.appName;
  linkImprint.innerHTML=language.GUI.imprint;
  linkPrivacy.innerHTML=language.GUI.privacy;
  linkMainHome.innerHTML=language.GUI.homeURL;
  linkMainHome.href="https://"+language.GUI.homeURL;
  infoLocalDataOnly2.querySelector("h3").innerHTML=language.GUI.privacyInfo1;
  infoLocalDataOnly2.querySelector("div").innerHTML=language.GUI.privacyInfo2;
  infoSimulators.innerHTML=language.GUI.simulators;
}

let LGSvaluesM=[];
let LGSvaluesb=[];

/**
 * Checks the content of a HTML input element while typing.
 * @param {Object} input HTML input element
 */
function checkInput(input) {
  if (input) {
    const ok=!isNaN(parseFloat(input.value.replaceAll(",",".")));
    input.style.backgroundColor=ok?"":"red";
  }

  if (localStorage) {
    localStorage.setItem("M",JSON.stringify(LGSvaluesM.map(row=>row.map(input=>input.value))));
    localStorage.setItem("b",JSON.stringify(LGSvaluesb.map(input=>input.value)));
    localStorage.setItem("digits",digitsSelect.value);
  }

  const M=LGSvaluesM.map(row=>row.map(input=>encodeURIComponent(input.value.replaceAll(";",""))).join(";")).join(";;");
  const b=LGSvaluesb.map(input=>encodeURIComponent(input.value.replaceAll(";",""))).join(";");
  const digits=digitsSelect.value;
  permalink.href=document.location.protocol+"//"+document.location.host+document.location.pathname+"?M="+M+"&b="+b+"&digits="+digits;
}

/**
 * Resets values to 0.
 * @param {Number} mode Object to reset (0=matrix; 1=vector)
 */
function resetValues(mode) {
  const needConfirmA=LGSvaluesM.map(row=>row.map(cell=>cell.value.replaceAll(",",".")).map(val=>parseFloat(val)).map(val=>isNaN(val)?1:Math.abs(val)).reduce((a,b)=>a+b,0)).reduce((a,b)=>a+b,0)>0;
  const needConfirmb=LGSvaluesb.map(cell=>cell.value.replaceAll(",",".")).map(val=>parseFloat(val)).map(val=>isNaN(val)?1:Math.abs(val)).reduce((a,b)=>a+b,0)>0;
  switch (mode) {
    case 0:
      if (needConfirmA && !confirm(language.GUI.resetMConfirm)) return;
      LGSvaluesM.forEach(row=>row.forEach(cell=>{cell.value="0"; cell.style.backgroundColor="";}));
      break;
    case 1:
      if (needConfirmb && !confirm(language.GUI.resetbConfirm)) return;
      LGSvaluesb.forEach(cell=>{cell.value="0"; cell.style.backgroundColor="";})
      break;
  }
  checkInput();
}

/**
 * Loads example values.
 * @param {Number} mode Example to load (0=fixed example values; 1=random values)
 */
function setValues(mode) {
  const needConfirmA=LGSvaluesM.map(row=>row.map(cell=>cell.value.replaceAll(",",".")).map(val=>parseFloat(val)).map(val=>isNaN(val)?1:Math.abs(val)).reduce((a,b)=>a+b,0)).reduce((a,b)=>a+b,0)>0;
  const needConfirmb=LGSvaluesb.map(cell=>cell.value.replaceAll(",",".")).map(val=>parseFloat(val)).map(val=>isNaN(val)?1:Math.abs(val)).reduce((a,b)=>a+b,0)>0;
  const needConfirm=needConfirmA || needConfirmb;
  if (needConfirm && !confirm(language.GUI.loadValuesConfirm)) return;
  switch (mode) {
    case 0: /* Examples */
      rowCount.value=3;
      colCount.value=3;
      updateLGSTable();
      for (let i=0;i<LGSvaluesM.length;i++) for (let j=0;j<LGSvaluesM.length;j++) {LGSvaluesM[i][j].value=3*i+j+1; LGSvaluesM[i][j].style.backgroundColor="";}
      for (let i=0;i<LGSvaluesb.length;i++) {LGSvaluesb[i].value=i+1; LGSvaluesb[i].style.backgroundColor="";}
      break;
    case 1: /* Random */
      for (let i=0;i<LGSvaluesM.length;i++) for (let j=0;j<LGSvaluesM.length;j++) {LGSvaluesM[i][j].value=Math.floor(10*Math.random()); LGSvaluesM[i][j].style.backgroundColor="";}
      for (let i=0;i<LGSvaluesb.length;i++) {LGSvaluesb[i].value=Math.floor(10*Math.random()); LGSvaluesb[i].style.backgroundColor="";}
      break;
  }
  checkInput();
}

/**
 * Updates the LGS table after row or col count change.
 */
function updateLGSTable(loadFromLocalStorage=false) {
  /* Load from localStorage */
  let loadM=null;
  let loadB=null;
  if (loadFromLocalStorage && localStorage) {
    loadM=localStorage.getItem("M");
    loadB=localStorage.getItem("b");
    const digits=parseInt(localStorage.getItem("digits"));
    if (loadM==null || loadB==null) {
      loadM=null;
      loadB=null;
    } else {
      try {
        loadM=JSON.parse(loadM);
        loadB=JSON.parse(loadB);
      } catch (err) {
        loadM=null;
        loadB=null;
      }
    }
    if (loadM!=null && loadB!=null) {
      rowCount.value=loadM.length;
      colCount.value=loadM[0].length;
    }
    if (!isNaN(digits)) {
      digitsSelect.value=digits;
    }
  }

  /* Get row and column count */
  const newRowCount=parseInt(rowCount.value);
  const newColCount=parseInt(colCount.value);

  /* Read old values */
  let oldLGSvaluesM;
  let oldLGSvaluesb;
  if (loadM!=null && loadB!=null) {
    oldLGSvaluesb=loadB.map(value=>{
      const input=document.createElement("input");
      input.value=value;
      return input;
    });
    oldLGSvaluesM=loadM.map(row=>row.map(value=>{
      const input=document.createElement("input");
      input.value=value;
      return input;
    }));
  } else {
    oldLGSvaluesM=LGSvaluesM;
    oldLGSvaluesb=LGSvaluesb;
  }

  /* Build new table */
  LGSArea.innerHTML="";
  let table, tr, td;

  LGSArea.appendChild(td=document.createElement("td"));
  td.innerHTML="(";
  td.style.fontSize=(newRowCount*100)+"%";

  LGSvaluesM=[];
  LGSArea.appendChild(table=document.createElement("table"));
  for (let i=0;i<newRowCount;i++) {
    const LGSvaluesMRow=[];
    table.appendChild(tr=document.createElement("tr"));
    for (let j=0;j<newColCount;j++) {
      const id="inputM-"+i+"-"+j;
      tr.appendChild(td=document.createElement("td"));
      const label=document.createElement("label");
      label.className="visuallyhidden";
      label.innerHTML="M("+(i+1)+";"+(j+1)+")";
      label.htmlFor=id;
      td.appendChild(label);
      const input=document.createElement("input");
      input.className="form-control";
      input.style.fontSize="80%";
      input.style.width="100px";
      input.value=(oldLGSvaluesM.length>i && oldLGSvaluesM[i].length>j)?oldLGSvaluesM[i][j].value:"0";
      input.oninput=()=>checkInput(input);
      input.id=id;
      td.appendChild(input);
      LGSvaluesMRow.push(input);
      checkInput(input);
    }
    LGSvaluesM.push(LGSvaluesMRow);
  }

  LGSArea.appendChild(td=document.createElement("td"));
  td.innerHTML=")";
  td.style.fontSize=(newRowCount*100)+"%";

  LGSArea.appendChild(td=document.createElement("td"));
  td.innerHTML="&middot;&nbsp;x&nbsp;=";
  td.style.verticalAlign="middle";

  LGSArea.appendChild(td=document.createElement("td"));
  td.innerHTML="(";
  td.style.fontSize=(newRowCount*100)+"%";

  LGSvaluesb=[];
  LGSArea.appendChild(table=document.createElement("table"));
  for (let i=0;i<newRowCount;i++) {
      const id="inputB-"+i;
      table.appendChild(tr=document.createElement("tr"));
      tr.appendChild(td=document.createElement("td"));
      const label=document.createElement("label");
      label.className="visuallyhidden";
      label.innerHTML="b("+(i+1)+")";
      label.htmlFor=id;
      td.appendChild(label);
      const input=document.createElement("input");
      input.className="form-control";
      input.style.fontSize="80%";
      input.style.width="100px";
      input.value=(oldLGSvaluesb.length>i)?oldLGSvaluesb[i].value:"0";
      input.oninput=()=>checkInput(input);
      input.id=id;
      td.appendChild(input);
      LGSvaluesb.push(input);
      checkInput(input);
  }

  LGSArea.appendChild(td=document.createElement("td"));
  td.innerHTML=")";
  td.style.fontSize=(newRowCount*100)+"%";
}

/**
 * Solves the LGS.
 */
function solve() {
  resultsAreaOuter.style.display="";
  let digits=parseInt(digitsSelect.value);

  /* Check input */
  const data=checkLGS(LGSvaluesM,LGSvaluesb,digits<0);
  if (typeof(data)=="string") {
    resultsArea.innerHTML=data;
    resultsArea.style.color="red";
    return;
  }
  resultsArea.style.color="";

  /* Fraction mode? */
  if (digits<0) {
    digits=3;
    for (let i=0;i<data[0].length;i++) for (let j=0;j<data[0][i].length;j++) data[0][i][j]=Fraction.fromNumber(data[0][i][j]);
    for (let i=0;i<data[1].length;i++) data[1][i]=Fraction.fromNumber(data[1][i]);
  }

  /* Solve LGS */
  const solution=calcSolution(data[0],data[1],digits);
  resultsArea.innerHTML=solution;
}

/**
 * Prepares the layout switcher which will remove the "loading..." text
 * and replace it with the app content.
 */
function startApp() {
    document.addEventListener('readystatechange',event=>{if (event.target.readyState=="complete") {
      if (isDesktopApp) {
        infoLocalDataOnly1.style.display="none";
        infoLocalDataOnly2.style.display="none";
      }
      mainContent.style.display="";
      infoLoading.style.display="none";
    }});
  }

  /**
   * Initializes the complete web app.
   */
  function initApp() {
    initGUILanguage();

    let M=null;
    let b=null;
    let digits=null;
    const search=window.location.search;
    if (search.startsWith("?")) for (let part of search.substring(1).split("&")) {
      if (part.startsWith("M=")) M=part.substring(2).split(";;").map(row=>row.split(";").map(str=>decodeURIComponent(str)));
      if (part.startsWith("b=")) b=part.substring(2).split(";").map(str=>decodeURIComponent(str));
      if (part.startsWith("digits=")) digits=part.substring(7).split(";").map(str=>decodeURIComponent(str));
    }
    if (M && b && M.length==b.length && M.length>0 && M[0].length>0) {
      rowCount.value=M.length;
      colCount.value=M[0].length;
      updateLGSTable();
      for (let i=0;i<M.length;i++) for (let j=0;j<Math.min(M[0].length,M[i].length);j++) LGSvaluesM[i][j].value=M[i][j];
      for (let i=0;i<b.length;i++) LGSvaluesb[i].value=b[i];
      updateLGSTable();
    } else {
      updateLGSTable(true);
    }
    if (digits) {
      digits=parseInt(digits);
      if (!isNaN(digits) && Array.from(digitsSelect.options).map(option=>parseInt(option.value)).indexOf(digits)>=0) digitsSelect.value=digits;
      updateLGSTable();
    }
    startApp();
  }
