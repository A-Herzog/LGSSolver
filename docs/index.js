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

import {selectLanguage} from './js/LanguageTools.js';
import {language} from "./js/Language.js";
import {initApp, isDesktopApp} from './js/Main.js';

function start() {
  /* Select language */
  if (selectLanguage([{name: "default", file: "index.html"}, {name: "de", file: "index_de.html"}])) return;

  /* Select color mode */
  let selectedColorMode=localStorage.getItem('selectedColorMode');
  if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
  document.documentElement.dataset.bsTheme=selectedColorMode;

  /* Init app */
  initApp();

  let downloadInfo="";
  if (isDesktopApp) {
    const footer=document.querySelector('footer');
    for (let link of footer.querySelectorAll("a")) if (link.href!='') {
      const href=link.href;
      link.onclick=()=>Neutralino.os.open(href);
      link.removeAttribute("href");
      link.style.cursor="pointer";
      link.classList.add("link-primary");
    }
  } else {
    const downloadButton="<button class='btn btn-primary dropdown-toggle my-1 bi-download' type='button' data-bs-toggle='dropdown' aria-expanded='false'>&nbsp;"+language.GUI.downloadButton+"</button>";
    const downloadOptions=[
      "<a class='dropdown-item bi bi-windows' href='https://github.com/A-Herzog/LGSSolver/releases/latest/download/LGSSolver.exe'>&nbsp;"+language.GUI.downloadButtonExe+"</a>",
      "<a class='dropdown-item bi bi-file-zip' href='https://github.com/A-Herzog/LGSSolver/releases/latest/download/LGSSolver_Linux_MacOS.zip'>&nbsp;"+language.GUI.downloadButtonZip+"</a>"
    ];
    downloadInfo+="<p class='mt-3'>"+language.GUI.downloadLabel+"</p><p><div class='dropdown'>"+downloadButton+"<ul class='dropdown-menu'><li>"+downloadOptions.join("</li><li>")+"</li></ul>"+"</div></p>";
  }
  infoArea.innerHTML=language.GUI.bookInfo+downloadInfo;
}

start();
