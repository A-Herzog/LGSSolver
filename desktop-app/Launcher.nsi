!define PrgName "LGSSolver"
!define PrgTempPathName "LGSSolver"
!define PrgFileName "LGSSolver"
!define PrgIcon "..\docs\favicon.ico"
!define Copyright "Alexander Herzog"

Name "${PrgName}"
Caption "${PrgName}"
Icon "${PrgIcon}"
OutFile "${PrgFileName}.exe"

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PrgName}"
VIAddVersionKey "FileDescription" "${PrgName}"
VIAddVersionKey "LegalCopyright" "${Copyright}"
VIAddVersionKey "CompanyName" "${Copyright}"
VIAddVersionKey "FileVersion" "1.0"
VIAddVersionKey "InternalName" "${PrgName}"

ManifestDPIAware true

SilentInstall silent
AutoCloseWindow true
ShowInstDetails nevershow
;ShowInstDetails show

RequestExecutionLevel user

Section ""
  SetOutPath "$TEMP\${PrgTempPathName}"

  File "..\dist\LGSSolver\LGSSolver-win_x64.exe"
  File "..\dist\LGSSolver\resources.neu"
  ; File "..\dist\LGSSolver\WebView2Loader.dll"

  ExecWait "$TEMP\${PrgTempPathName}\LGSSolver-win_x64.exe"

  RmDir /r "$TEMP\${PrgTempPathName}"
SectionEnd