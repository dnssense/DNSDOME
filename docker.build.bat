@echo off
set /p version="Enter version: "
cd angular
call npm run build-prod
cd..
docker build -t ui.dnssense.kodiks .
docker tag ui.dnssense.kodiks registry.sea.net/dnssense/ui.dnssense.kodiks:%version%
:start
SET choice=
SET /p choice=Do you want to push? [Y/N]: 
IF NOT '%choice%'=='' SET choice=%choice:~0,1%
IF '%choice%'=='Y' GOTO yes
IF '%choice%'=='y' GOTO yes
IF '%choice%'=='N' GOTO no
IF '%choice%'=='n' GOTO no
IF '%choice%'=='' GOTO no
ECHO "%choice%" is not valid
ECHO.
GOTO start

:no
ECHO Exiting!
EXIT

:yes
ECHO Your package is pushing!
docker push registry.sea.net/dnssense/ui.dnssense:%version%
EXIT