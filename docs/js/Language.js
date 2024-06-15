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

export {language};

let lang;

/* German */

const languageDE={};
lang=languageDE;

lang.GUI={};
lang.GUI.appName="Lineare Gleichungssysteme Löser";
lang.GUI.homeURL="warteschlangensimulation.de";
lang.GUI.imprint="Impressum";
lang.GUI.privacy="Datenschutz";
lang.GUI.privacyInfo1="Info";
lang.GUI.privacyInfo2="Alle Berechnungen laufen vollständig im Browser ab.<br>Diese Webapp führt nach dem Laden des HTML- und Skriptcodes keine weitere Kommunikation mit dem Server durch.";
lang.GUI.simulators="Simulatoren";
lang.GUI.switchLanguage="Switch to <b>English</b>";
lang.GUI.switchLanguageHint="Switch to English";
lang.GUI.switchLanguageShort="English";
lang.GUI.switchLanguageMode='default';
lang.GUI.switchLanguageFile="index.html";
lang.GUI.tabColorMode="Farbmodus";
lang.GUI.tabColorModeLight="Hell";
lang.GUI.tabColorModeDark="Dunkel";
lang.GUI.tabColorModeSystemDefault="Systemvorgabe";
lang.GUI.downloadTitle="Download";
lang.GUI.downloadLabel="Diese Webapp steht auch als offline-nutzbare Windows-Anwendung zur Verfügung:";
lang.GUI.downloadButton="Windows-Anwendung (exe)";
lang.GUI.solutionOfLGS="Lösung des linearen Gleichungssystems";
lang.GUI.mainInfo="Sind in der Gleichung <b>A</b>x=<b>b</b> die Variablen <b>A</b> eine Matrix und <b>b</b> ein Vektor, so spricht man von einem linearen Gleichungssystem. Diese Webapp kann lineare Gleichungssysteme mit Hilfe des Gauß-Algorithmus auflösen.";
lang.GUI.rows="Zeilen";
lang.GUI.col="Spalte";
lang.GUI.cols="Spalten";
lang.GUI.example="Beispielwerte";
lang.GUI.random="Zufallswerte";
lang.GUI.resetMConfirm="Soll die Matrix wirklich mit 0-Werten gefüllt werden?";
lang.GUI.resetbConfirm="Soll der Vektor wirklich mit 0-Werten gefüllt werden?";
lang.GUI.loadValuesConfirm="Sollen die bisherigen Werte für A und b wirklich ersetzt werden?";
lang.GUI.solve="Lösen";
lang.GUI.errorM="Die angegebenen Werte in der Matrix <b>M</b> sind ungültig.";
lang.GUI.errorb="Die angegebenen Werte in dem Vektor <b>b</b> sind ungültig.";
lang.GUI.initialSystem="Ausgangssystem";
lang.GUI.generationOf="Erzeugung von";
lang.GUI.generationOfZeros="Erzeugen von Nullen in";
lang.GUI.alreadyCase="Ist bereits der Fall.";
lang.GUI.and="und";
lang.GUI.for="für";
lang.GUI.swappingRows="Tausch der Zeilen";
lang.GUI.swappingRowsCols="und gleichzeitig der Spalten";
lang.GUI.swappingCols="Tausch der Spalten";
lang.GUI.notPossible="Ist nicht möglich.";
lang.GUI.multiplyRow1="Multiplikation der";
lang.GUI.multiplyRow2=". Zeile mit";
lang.GUI.addRow1="Addition des";
lang.GUI.addRow2="-fachen der";
lang.GUI.addRow3=". Zeile zur";
lang.GUI.addRow4=". Zeile";
lang.GUI.noSolution1="In Zeile";
lang.GUI.noSolution2="steht";
lang.GUI.noSolution3="d.h. das System besitzt keine Lösung";
lang.GUI.underdetermined1="Das System ist";
lang.GUI.underdetermined2="-fach unterbestimmt.";
lang.GUI.underdetermined3="Das System besitzt";
lang.GUI.underdetermined4="Variablen, aber nur";
lang.GUI.underdetermined5="linear unabhängige Zeilen.";
lang.GUI.underdetermined6="Der Lösungsraum wird aus einer Linearkombination der <span style=\"color: green;\">grün markierten</span> Spalten mit umgekehrten Vorzeichen, die um den Vektor der <span style=\"color: #AAF;\">rechte Seite</span> des Systems verschoben wird, gebildet.";
lang.GUI.oneSolution1="<p>Das System besitzt genau eine Lösung.";
lang.GUI.oneSolution2="<br>Die <span style=\"color: #AAF;\">rechte Seite</span> des Systems nach dem letzten Gauß-Schritt stellt den Lösungsvektor dar.</p>";
lang.GUI.reswapBefore="Vor der Rücksortierung der Spalten";
lang.GUI.reswap="Rücksortierung der Spalten";
lang.GUI.finalSolution="Finale Lösung des Systems";
lang.GUI.bookInfo=`
<h3>Weiterführende Literatur</h3>
<p>
<a href="https://link.springer.com/book/10.1007/978-3-658-36742-8" target="_blank">
<img src="./images/BrueckenkursCover.webp" style="float: left; margin-right: 10px; max-height: 175px;" alt="Brückenkurs Mathematik für Wirtschaftswissenschaftler" title="Brückenkurs Mathematik für Wirtschaftswissenschaftler">
</a>
Als weiterführende Literatur zum Thema der linearen Gleichungssysteme wird empfohlen:<br>
<a href="https://link.springer.com/book/10.1007/978-3-658-36742-8" target="_blank">W. Purkert, A. Herzog: <b>Brückenkurs Mathematik für Wirtschaftswissenschaftler</b>, 9. Auflage, Springer, 2022.</a><br>
DOI: <a href="https://doi.org/10.1007/978-3-658-36742-8" target="_blank">https://doi.org/10.1007/978-3-658-36742-8</a>, ISBN: 978-3-658-36741-1<br>
(siehe dort Kapitel 7.2)
<br clear="both">
</p>
`;

/* English */

const languageEN={};
lang=languageEN;

lang.GUI={};
lang.GUI.appName="Linear equation system solver";
lang.GUI.homeURL="queueingsimulation.de";
lang.GUI.imprint="Imprint";
lang.GUI.privacy="Privacy";
lang.GUI.privacyInfo1="Info";
lang.GUI.privacyInfo2="All calculations are performed entirely in the browser.<br>This Webapp does not perform any further communication with the server after loading the HTML and script code.";
lang.GUI.simulators="Simulators";
lang.GUI.switchLanguage="Auf <b>Deutsch</b> umschalten";
lang.GUI.switchLanguageHint="Auf Deutsch umschalten";
lang.GUI.switchLanguageShort="Deutsch";
lang.GUI.switchLanguageMode='de';
lang.GUI.switchLanguageFile="index_de.html";
lang.GUI.tabColorMode="Color mode";
lang.GUI.tabColorModeLight="Light";
lang.GUI.tabColorModeDark="Dark";
lang.GUI.tabColorModeSystemDefault="System default";
lang.GUI.downloadTitle="Download";
lang.GUI.downloadLabel="This webapp is also available as an offline usable Windows application:";
lang.GUI.downloadButton="Windows application (exe)";
lang.GUI.solutionOfLGS="Solution of the linear equation system";
lang.GUI.mainInfo="If the variable <b>A</b> is a matrix and <b>b</b> is a vector in the equation <b>A</b>x=<b>b</b>, this is referred to as a system of linear equations. This web app can solve systems of linear equations using the Gaussian algorithm.";
lang.GUI.rows="Rows";
lang.GUI.col="Column";
lang.GUI.cols="Columns";
lang.GUI.example="Example values";
lang.GUI.random="Random values";
lang.GUI.resetMConfirm="Do you really want to fill the matrix with 0 values?";
lang.GUI.resetbConfirm="Do you really want to fill the vector with 0 values?";
lang.GUI.loadValuesConfirm="Do you really want to replace the current values for A and b?";
lang.GUI.solve="Solve";
lang.GUI.errorM="The specified values in the matrix <b>M</b> are invalid.";
lang.GUI.errorb="The specified values in the vector <b>b</b> are invalid.";
lang.GUI.initialSystem="Initial system";
lang.GUI.generationOf="Generation of";
lang.GUI.generationOfZeros="Generation of zeros in";
lang.GUI.alreadyCase="Is already the case.";
lang.GUI.and="and";
lang.GUI.for="for";
lang.GUI.swappingRows="Swapping of the rows";
lang.GUI.swappingRowsCols="and at the same time of the columns";
lang.GUI.swappingCols="Swapping of the columns";
lang.GUI.notPossible="Is not possible.";
lang.GUI.multiplyRow1="Multiply of the ";
lang.GUI.multiplyRow2="th row with";
lang.GUI.addRow1="Add";
lang.GUI.addRow2=" times the";
lang.GUI.addRow3="th row to the";
lang.GUI.addRow4="th row";
lang.GUI.noSolution1="In row";
lang.GUI.noSolution2="we have";
lang.GUI.noSolution3="therefore the system has no solution";
lang.GUI.underdetermined1="The system is";
lang.GUI.underdetermined2=" times underdetermined.";
lang.GUI.underdetermined3="The system has";
lang.GUI.underdetermined4="variables, but only";
lang.GUI.underdetermined5="linearly independent rows.";
lang.GUI.underdetermined6="The solution space is calculated from a linear combination of the columns <span style=\"color: green;\">marked in green</span> with switched signs, which is shifted by the vector of the <span style=\"color: #AAF;\">right side</span>.";
lang.GUI.oneSolution1="<p>The system has exactly one solution.";
lang.GUI.oneSolution2="<br>The <span style=\"color: #AAF;\">right side</span> of the system after the last Gauß step is the solution vector.</p>";
lang.GUI.reswapBefore="Before sorting back the columns";
lang.GUI.reswap="Sorting back the columns";
lang.GUI.finalSolution="Final solution of the system";
lang.GUI.bookInfo="";

/* Activate language */

const language=(document.documentElement.lang=='de')?languageDE:languageEN;
