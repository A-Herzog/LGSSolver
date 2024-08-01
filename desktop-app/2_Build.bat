cd ..
del LGSSolver.exe
del LGSSolver_Linux_MacOS.zip
call neu.cmd build --release
cd desktop-app
"C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
move LGSSolver.exe ..
cd ..
move .\dist\LGSSolver-release.zip LGSSolver_Linux_MacOS.zip
rmdir /S /Q dist
cd desktop-app