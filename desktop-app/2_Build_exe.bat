cd ..
del LGSSolver.exe

call neu.cmd build --release --embed-resources

move .\dist\LGSSolver\LGSSolver-win_x64.exe LGSSolver.exe
rmdir /S /Q dist
cd desktop-app